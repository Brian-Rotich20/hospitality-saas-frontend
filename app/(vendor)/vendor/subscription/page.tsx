'use client';

// Vendor billing. The subscription is the only payment LinkMart processes; bookings are paid
// to vendors directly. Contract: backend/docs/api/FRONTEND-INTEGRATION-GUIDE.md §6–7.
// - Prices come only from GET /subscriptions/me (currentPlan / openInvoice); none are invented.
// - With no plan configured (billingHoldReason 'no_active_plan' / currentPlan null) nothing is payable.
// - A payment counts only after the backend verifies it: we poll GET /me/payments/:id, never
//   trusting the Paystack redirect or the phone prompt.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, RefreshCw, Smartphone } from 'lucide-react';
import { subscriptionService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import type {
  Invoice, PaymentAttempt, PaymentHistoryRow, PaymentMethods, SubscriptionOverview,
} from '../../../lib/types/subscription';
import {
  ATTEMPT_LABEL, STATUS_LABEL, billingErrorMessage, billingHeld, formatDay, formatMoney, isFinalAttempt,
  normaliseKenyanPhone, subscriptionHeadline,
} from '../../../lib/subscriptions/subscription-ui';
import { Badge, Card, DescriptionList, EmptyState, Notice, PageHeader, Skeleton, Table } from '../../../components/ui/Surface';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/Dialog';

const PENDING_KEY = 'lm.subscription.pendingPayment';
const POLL_MS = 3000;
const POLL_LIMIT_MS = 2.5 * 60_000;

type Method = 'mpesa' | 'paystack';

const newKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`);

function rememberPending(id: string) { try { sessionStorage.setItem(PENDING_KEY, id); } catch { /* optional */ } }
function takePending(): string | null { try { return sessionStorage.getItem(PENDING_KEY); } catch { return null; } }
function forgetPending() { try { sessionStorage.removeItem(PENDING_KEY); } catch { /* optional */ } }

const statusTone = (s: string) =>
  s === 'trialing' || s === 'active' ? 'success' : s === 'past_due' ? 'warning' : s === 'legacy_unenrolled' ? 'neutral' : 'error';
const attemptTone = (s: string) =>
  s === 'succeeded' ? 'success' : s === 'pending' || s === 'initiated' ? 'warning' : s === 'reversed' ? 'info' : 'error';
const invoiceTone = (s: string) => (s === 'paid' ? 'success' : s === 'open' ? 'warning' : 'neutral');

export default function SubscriptionPage() {
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [methods, setMethods] = useState<PaymentMethods | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [method, setMethod] = useState<Method | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<PaymentAttempt | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const idemKey = useRef<string | null>(null);
  const inFlight = useRef(false);

  const [confirm, setConfirm] = useState<'cancel' | 'resume' | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [o, m] = await Promise.all([subscriptionService.overview(), subscriptionService.paymentMethods()]);
      setOverview(o.data);
      setMethods(m.data);
    } catch (err) {
      setLoadError(billingErrorMessage(err, 'Could not load your subscription.'));
      return;
    }
    // History is secondary: its failure must not hide the overview.
    const [inv, pay] = await Promise.allSettled([subscriptionService.invoices(), subscriptionService.payments()]);
    setInvoices(inv.status === 'fulfilled' && Array.isArray(inv.value.data) ? inv.value.data : []);
    setPayments(pay.status === 'fulfilled' && Array.isArray(pay.value.data) ? pay.value.data : []);
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  // Default to the first available method.
  useEffect(() => {
    if (methods && !method) setMethod(methods.mpesa ? 'mpesa' : methods.paystack ? 'paystack' : null);
  }, [methods, method]);

  // Poll a pending attempt (after an M-Pesa prompt, or on return from Paystack checkout).
  const pollAttempt = useCallback((id: string) => {
    setPollTimedOut(false);
    const started = Date.now();
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const res = await subscriptionService.payment(id);
        setAttempt(res.data);
        if (isFinalAttempt(res.data.status)) {
          forgetPending();
          if (res.data.status === 'succeeded') toast.success('Payment received. Thank you.');
          void loadAll();
          return;
        }
      } catch (err) {
        if ((err as ApiError).status === 404) { forgetPending(); return; }
      }
      if (Date.now() - started > POLL_LIMIT_MS) { setPollTimedOut(true); return; }
      window.setTimeout(() => void tick(), POLL_MS);
    };
    void tick();
    return () => { stopped = true; };
  }, [loadAll]);

  useEffect(() => {
    const pending = takePending();
    if (pending) return pollAttempt(pending);
    return undefined;
  }, [pollAttempt]);

  const held = overview ? billingHeld(overview) : false;
  const amountDue = overview?.openInvoice?.amountMinor ?? (overview && (overview.status === 'cancelled' || overview.status === 'expired') ? overview.currentPlan?.amountMinor : undefined);
  const currency = overview?.openInvoice?.currency ?? overview?.currentPlan?.currency ?? 'KES';
  const payable = !!overview && !held && amountDue !== undefined && overview.status !== 'legacy_unenrolled';
  const anyMethod = !!methods && (methods.mpesa || methods.paystack);
  const attemptActive = attempt && !isFinalAttempt(attempt.status);

  const pay = async () => {
    if (!method || inFlight.current) return;
    let body: { provider: 'paystack' } | { provider: 'mpesa'; phone: string };
    if (method === 'mpesa') {
      const normalised = normaliseKenyanPhone(phone);
      if (!normalised) { setPhoneError('Enter a Safaricom number, for example 0712 345 678.'); return; }
      setPhoneError(null);
      body = { provider: 'mpesa', phone: normalised };
    } else {
      body = { provider: 'paystack' };
    }
    inFlight.current = true;
    setPaying(true);
    setPayError(null);
    idemKey.current ??= newKey(); // reused if this same action is retried after a network error
    try {
      const res = await subscriptionService.pay(body, idemKey.current);
      idemKey.current = null;
      setAttempt(res.data);
      rememberPending(res.data.id);
      if (method === 'paystack') {
        if (res.data.checkoutUrl) { window.location.assign(res.data.checkoutUrl); return; }
        setPayError('The card checkout could not be opened. Please try again.');
        forgetPending();
        return;
      }
      pollAttempt(res.data.id);
    } catch (err) {
      const e = err as ApiError;
      if (e.status !== undefined) idemKey.current = null; // the server answered: next click is a new action
      if (e.code === 'IDEMPOTENCY_KEY_REUSED') idemKey.current = null;
      if (e.code === 'NO_PAYMENT_DUE' || e.code === 'NO_ACTIVE_PLAN') void loadAll();
      setPayError(billingErrorMessage(err));
    } finally {
      inFlight.current = false;
      setPaying(false);
    }
  };

  const runAction = async () => {
    if (!confirm) return;
    setActionBusy(true);
    setActionError(null);
    try {
      if (confirm === 'cancel') await subscriptionService.cancel(); else await subscriptionService.resume();
      toast.success(confirm === 'cancel' ? 'Subscription cancelled' : 'Cancellation undone');
      setConfirm(null);
      await loadAll();
    } catch (err) {
      setActionError(billingErrorMessage(err));
    } finally {
      setActionBusy(false);
    }
  };

  const headline = useMemo(() => (overview ? subscriptionHeadline(overview) : null), [overview]);

  if (loadError) {
    return (
      <div className="max-w-[860px] mx-auto">
        <PageHeader title="Subscription" />
        <Notice tone="error" title={loadError}
          action={<Button variant="secondary" size="sm" onClick={() => void loadAll()}><RefreshCw size={13} aria-hidden /> Retry</Button>} />
      </div>
    );
  }

  if (!overview || !methods) {
    return (
      <div className="max-w-[860px] mx-auto" aria-busy="true">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-80 mb-6" />
        <Skeleton className="h-56 w-full rounded-2xl mb-4" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const s = overview.subscription;
  const facts = [
    { label: 'Status', value: <Badge tone={statusTone(overview.status)} dot>{STATUS_LABEL[overview.status]}</Badge> },
    ...(overview.status === 'trialing' && s ? [{ label: 'Free trial ends', value: formatDay(s.trialEndsAt) }] : []),
    ...(overview.status === 'active' && s?.currentPeriodEnd ? [{ label: s.cancelAtPeriodEnd ? 'Ends on' : 'Paid until', value: formatDay(s.currentPeriodEnd) }] : []),
    ...(overview.status === 'past_due' && s?.graceEndsAt ? [{ label: 'Pay by', value: formatDay(s.graceEndsAt) }] : []),
    { label: 'Price', value: overview.currentPlan ? `${formatMoney(overview.currentPlan.amountMinor, overview.currentPlan.currency)} per ${overview.currentPlan.interval}` : 'Not set yet' },
    ...(overview.openInvoice ? [{ label: 'Amount due', value: formatMoney(overview.openInvoice.amountMinor, overview.openInvoice.currency) }] : []),
  ];

  const canCancel = s && ((s.status === 'trialing' || s.status === 'active') && !s.cancelAtPeriodEnd || s.status === 'past_due' || s.status === 'suspended');
  const canResume = s && s.cancelAtPeriodEnd && (s.status === 'trialing' || s.status === 'active');
  const cancelImmediate = s?.status === 'past_due' || s?.status === 'suspended';
  const periodEnd = s?.status === 'trialing' ? s.trialEndsAt : s?.currentPeriodEnd;

  return (
    <div className="max-w-[860px] mx-auto space-y-5">
      <PageHeader title="Subscription"
        description="Your LinkMart plan. Customers pay you directly for bookings; the subscription is the only payment LinkMart takes." />

      {/* State notices */}
      {overview.status === 'legacy_unenrolled' ? (
        <Notice tone="info" title="You’re not enrolled in a subscription yet">There’s nothing to pay, and your listings stay visible.</Notice>
      ) : held && (overview.status === 'trialing' || overview.status === 'active' || !overview.openInvoice) ? (
        <Notice tone="info" title="Subscription pricing hasn’t been set yet">There’s nothing to pay right now. Your listings stay visible.</Notice>
      ) : overview.status === 'suspended' ? (
        <Notice tone="error" title="Your listings are hidden">Customers can’t find or book you until the amount due is paid.</Notice>
      ) : overview.status === 'past_due' ? (
        <Notice tone="warning" title={headline?.title}>{headline?.detail}</Notice>
      ) : overview.status === 'expired' || overview.status === 'cancelled' ? (
        <Notice tone="error" title={headline?.title}>Your listings are hidden. Resubscribe to show them again.</Notice>
      ) : s?.cancelAtPeriodEnd ? (
        <Notice tone="info" title={`Your subscription ends on ${formatDay(periodEnd)}`}
          action={<Button size="sm" variant="secondary" onClick={() => setConfirm('resume')}>Keep subscription</Button>}>
          Your listings stay visible until then.
        </Notice>
      ) : null}

      {attempt && (
        attempt.status === 'succeeded' ? (
          <Notice tone="success" title={`Payment of ${formatMoney(attempt.amountMinor, attempt.currency)} received`}>
            {attempt.receipt ? `Receipt ${attempt.receipt}. ` : ''}Your subscription has been updated.
          </Notice>
        ) : attempt.status === 'failed' || attempt.status === 'cancelled' ? (
          <Notice tone="error" title={attempt.status === 'cancelled' ? 'The payment was not completed' : 'The payment failed'}
            action={<Button size="sm" variant="secondary" onClick={() => setAttempt(null)}>Try again</Button>}>
            {attempt.provider === 'mpesa' && attempt.status === 'cancelled' ? 'The M-Pesa prompt was dismissed or timed out. ' : ''}
            {attempt.failureReason ?? 'No money was taken for this attempt.'}
          </Notice>
        ) : (
          <Notice tone="info" role="status"
            title={attempt.provider === 'mpesa' ? 'Check your phone and enter your M-Pesa PIN' : 'Confirming your card payment…'}>
            {attempt.provider === 'mpesa' && (attempt.message ?? `We sent a payment request to ${attempt.phone ?? 'your phone'}.`)}
            {pollTimedOut
              ? <span className="block mt-1">Still waiting for confirmation. It can take a few minutes; this page updates when it arrives. <button className="underline font-semibold" onClick={() => attempt && pollAttempt(attempt.id)}>Check again</button></span>
              : <span className="block mt-1">This updates automatically once the payment is confirmed.</span>}
          </Notice>
        )
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] items-start">
        <Card title="Your plan">
          <DescriptionList items={facts} />
          {(canCancel || canResume) && (
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
              {canResume && <Button variant="secondary" onClick={() => setConfirm('resume')}>Keep subscription</Button>}
              {canCancel && <Button variant="ghost" onClick={() => setConfirm('cancel')}>Cancel subscription</Button>}
            </div>
          )}
        </Card>

        {payable && (
          <Card title={overview.status === 'cancelled' || overview.status === 'expired' ? 'Resubscribe' : 'Pay now'}
            description={`${formatMoney(amountDue!, currency)} for one ${overview.currentPlan?.interval ?? 'month'}`}>
            {!anyMethod ? (
              <p className="text-[14px] text-text-secondary">Online payment isn’t available at the moment. Please try again later.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); void pay(); }} noValidate>
                <fieldset disabled={paying || !!attemptActive}>
                  <legend className="sr-only">Payment method</legend>
                  <div className="grid gap-2">
                    {methods.mpesa && (
                      <label className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors ${method === 'mpesa' ? 'border-ink bg-page' : 'border-border hover:border-border-strong'}`}>
                        <input type="radio" name="method" className="accent-[#00831E]" checked={method === 'mpesa'} onChange={() => setMethod('mpesa')} />
                        <Smartphone size={18} className="text-text-secondary" aria-hidden />
                        <span className="text-[14px] font-semibold text-text-primary">M-Pesa</span>
                      </label>
                    )}
                    {methods.paystack && (
                      <label className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors ${method === 'paystack' ? 'border-ink bg-page' : 'border-border hover:border-border-strong'}`}>
                        <input type="radio" name="method" className="accent-[#00831E]" checked={method === 'paystack'} onChange={() => setMethod('paystack')} />
                        <CreditCard size={18} className="text-text-secondary" aria-hidden />
                        <span className="text-[14px] font-semibold text-text-primary">Card</span>
                      </label>
                    )}
                  </div>

                  {method === 'mpesa' && (
                    <div className="mt-4">
                      <label htmlFor="mpesa-phone" className="block text-[13px] font-semibold text-text-primary mb-1.5">M-Pesa phone number</label>
                      <input id="mpesa-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone}
                        onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }}
                        placeholder="0712 345 678" aria-invalid={!!phoneError} aria-describedby={phoneError ? 'phone-err' : undefined}
                        className={`w-full h-11 rounded-[10px] border px-3.5 text-[15px] outline-none bg-card focus:ring-2 focus:ring-ink/15
                          ${phoneError ? 'border-error' : 'border-border-strong focus:border-ink'}`} />
                      {phoneError && <p id="phone-err" className="mt-1.5 text-[13px] text-error">{phoneError}</p>}
                    </div>
                  )}

                  <Button type="submit" block size="lg" className="mt-4" loading={paying}
                    loadingText={method === 'paystack' ? 'Opening checkout…' : 'Sending request…'}>
                    Pay {formatMoney(amountDue!, currency)}{method === 'paystack' ? ' by card' : ' with M-Pesa'}
                  </Button>
                  <p className="mt-2.5 text-[12px] text-text-muted">
                    {method === 'paystack' ? 'You’ll finish on Paystack’s secure checkout, then return here.' : 'You’ll get a prompt on your phone to enter your M-Pesa PIN.'}
                  </p>
                </fieldset>
                {payError && <p role="alert" className="mt-3 text-[13px] text-error">{payError}</p>}
              </form>
            )}
          </Card>
        )}
      </div>

      {methods.paystackRecurring && s && <AutoRenew enabled={s.autoRenewOptIn} onChanged={() => void loadAll()} />}

      <Card title="Invoices" padded={false}>
        {invoices === null ? <div className="p-5"><Skeleton className="h-16 w-full" /></div>
          : invoices.length === 0 ? <EmptyState title="No invoices yet">Invoices appear here when a billing period starts.</EmptyState>
          : (
            <Table label="Invoices">
              <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due</th><th>Paid</th></tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{formatDay(inv.periodStart)} – {formatDay(inv.periodEnd)}</td>
                    <td className="font-medium">{formatMoney(inv.amountMinor, inv.currency)}</td>
                    <td><Badge tone={invoiceTone(inv.status)}>{inv.status === 'open' ? 'Due' : inv.status === 'paid' ? 'Paid' : 'Void'}</Badge></td>
                    <td>{formatDay(inv.dueAt)}</td>
                    <td>{inv.paidAt ? formatDay(inv.paidAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
      </Card>

      <Card title="Payments" padded={false}>
        {payments === null ? <div className="p-5"><Skeleton className="h-16 w-full" /></div>
          : payments.length === 0 ? <EmptyState title="No payments yet">Your subscription payments will be listed here.</EmptyState>
          : (
            <Table label="Payments">
              <thead><tr><th>Date</th><th>Method</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDay(p.createdAt)}</td>
                    <td>{p.provider === 'daraja' ? `M-Pesa${p.phoneMasked ? ` · ${p.phoneMasked}` : ''}` : 'Card'}</td>
                    <td className="font-medium">{formatMoney(p.amountMinor, p.currency)}</td>
                    <td><Badge tone={attemptTone(p.status)}>{ATTEMPT_LABEL[p.status]}</Badge></td>
                    <td className="text-text-secondary">{p.providerReceipt ?? p.providerReference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
      </Card>

      {confirm === 'cancel' && (
        <ConfirmDialog title="Cancel your subscription?" tone="danger" confirmLabel="Cancel subscription" busyLabel="Cancelling…"
          cancelLabel="Keep subscription" busy={actionBusy} error={actionError}
          onConfirm={() => void runAction()} onClose={() => { setConfirm(null); setActionError(null); }}>
          {cancelImmediate
            ? 'This takes effect now. The amount due is cleared and your listings stay hidden until you resubscribe.'
            : `This takes effect on ${formatDay(periodEnd)}. Until then your listings stay visible, and you can undo it.`}
        </ConfirmDialog>
      )}
      {confirm === 'resume' && (
        <ConfirmDialog title="Keep your subscription?" confirmLabel="Keep subscription" busyLabel="Saving…"
          busy={actionBusy} error={actionError}
          onConfirm={() => void runAction()} onClose={() => { setConfirm(null); setActionError(null); }}>
          The scheduled cancellation is removed and your subscription continues.
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Saved-card renewal. Rendered only when the backend reports paystackRecurring: true (off pending decision D4). */
function AutoRenew({ enabled, onChanged }: { enabled: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      await subscriptionService.setAutoRenew(!enabled);
      onChanged();
    } catch (err) {
      toast.error(billingErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Automatic card renewal" description="Renew each period with the card you last paid with."
      action={<Button size="sm" variant="secondary" loading={busy} onClick={() => void toggle()}>{enabled ? 'Turn off' : 'Turn on'}</Button>} />
  );
}
