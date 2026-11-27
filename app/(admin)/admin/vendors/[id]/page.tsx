'use client';

// One vendor: account, moderation (suspend / reinstate, audited, reason optional 5–500)
// and billing investigation (GET /admin/subscriptions/vendors/:id, read-only).
// Payout details are never shown to admins: the API returns only hasPayoutDetails.

import { useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { adminBillingService, adminService } from '../../../../lib/api/endpoints';
import type { ApiError } from '../../../../lib/api/client';
import { useLoad } from '../../../../lib/hooks/useLoad';
import type { AdminVendorBilling } from '../../../../lib/types/subscription';
import { ATTEMPT_LABEL, STATUS_LABEL, formatDay, formatMoney } from '../../../../lib/subscriptions/subscription-ui';
import { Badge, Card, DescriptionList, EmptyState, Notice, PageHeader, Skeleton, Table } from '../../../../components/ui/Surface';
import { Button } from '../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../components/ui/Dialog';

interface AdminVendor {
  id: string; businessName: string; slug: string; phoneNumber: string | null; logo: string | null; verified: boolean;
  status: 'approved' | 'suspended'; createdAt: string; hasPayoutDetails: boolean; userId: string;
  subscription: { entitled: boolean; status: string };
}

type Action = 'suspend' | 'reinstate' | 'enrol';

export default function AdminVendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const vendor = useLoad(() => adminService.getVendorById(id) as unknown as Promise<{ data: AdminVendor }>, [id]);
  const billing = useLoad(() => adminBillingService.vendorBilling(id), [id]);
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const v = vendor.data;
  const b: AdminVendorBilling | null = billing.data;
  const trimmed = reason.trim();
  const reasonInvalid = action === 'suspend' && trimmed.length > 0 && trimmed.length < 5;

  const run = async () => {
    if (!action || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      if (action === 'suspend') await adminService.suspendVendor(id, trimmed || undefined);
      else if (action === 'reinstate') await adminService.reinstateVendor(id, trimmed || undefined);
      else await adminBillingService.enrol(id);
      toast.success(action === 'suspend' ? 'Vendor suspended' : action === 'reinstate' ? 'Vendor reinstated' : 'Free trial started');
      setAction(null);
      setReason('');
      await Promise.all([vendor.reload(), billing.reload()]);
    } catch (err) {
      const e = err as ApiError;
      setActionError(e.code === 'NO_CHANGE' ? 'Nothing changed: the vendor is already in that state.'
        : e.code === 'SUBSCRIPTION_EXISTS' ? 'This vendor already has a subscription.'
        : e.message || 'The action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (vendor.error) {
    return (
      <div>
        <PageHeader title={vendor.error.status === 404 || vendor.error.status === 422 ? 'Vendor not found' : 'Could not load this vendor'}
          back={{ href: '/admin/vendors', label: 'Vendors' }} />
        {vendor.error.status !== 404 && vendor.error.status !== 422 && (
          <Button variant="secondary" onClick={() => void vendor.reload()}>Retry</Button>
        )}
      </div>
    );
  }
  if (!v) {
    return (
      <div aria-busy="true"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-56 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div></div>
    );
  }

  const legacy = b?.entitlement.status === 'legacy_unenrolled';

  return (
    <div className="space-y-5">
      <PageHeader title={v.businessName} back={{ href: '/admin/vendors', label: 'Vendors' }}
        actions={v.status === 'suspended'
          ? <Button onClick={() => setAction('reinstate')}>Reinstate vendor</Button>
          : <Button variant="secondary" onClick={() => setAction('suspend')}>Suspend vendor</Button>} />

      {v.status === 'suspended' && (
        <Notice tone="error" title="This vendor is suspended">
          Their listings are hidden and they can’t create, edit or publish. They can still reach billing and their existing bookings.
        </Notice>
      )}

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <Card title="Account">
          <DescriptionList items={[
            { label: 'Status', value: v.status === 'suspended' ? <Badge tone="error" dot>Suspended</Badge> : <Badge tone="success" dot>Active</Badge> },
            { label: 'Phone', value: v.phoneNumber ?? '—' },
            { label: 'Public page slug', value: v.slug },
            { label: 'Joined', value: formatDay(v.createdAt) },
            { label: 'Payout details on file', value: v.hasPayoutDetails ? 'Yes' : 'No' },
          ]} />
        </Card>

        <Card title="Subscription" action={legacy ? <Button size="sm" variant="secondary" onClick={() => setAction('enrol')}>Start free trial</Button> : undefined}>
          {billing.loading && !b ? <Skeleton className="h-28 w-full" /> : billing.error ? (
            <Notice tone="error" title="Could not load billing" action={<Button size="sm" variant="secondary" onClick={() => void billing.reload()}>Retry</Button>} />
          ) : b && (
            <DescriptionList items={[
              { label: 'Status', value: <Badge tone={b.entitlement.entitled ? 'success' : 'error'} dot>{STATUS_LABEL[b.entitlement.status] ?? b.entitlement.status}</Badge> },
              { label: 'Listings visible', value: v.status === 'suspended' ? 'No (account suspended)' : b.entitlement.entitled ? 'Yes' : 'No' },
              ...(b.subscription ? [
                { label: 'Trial ends', value: formatDay(b.subscription.trialEndsAt) },
                { label: 'Current period ends', value: formatDay(b.subscription.currentPeriodEnd) },
                ...(b.subscription.graceEndsAt ? [{ label: 'Pay by', value: formatDay(b.subscription.graceEndsAt) }] : []),
                ...(b.subscription.billingHoldReason ? [{ label: 'Billing held', value: b.subscription.billingHoldReason === 'no_active_plan' ? 'No price set' : b.subscription.billingHoldReason }] : []),
                { label: 'Saved card', value: b.subscription.hasSavedCard ? 'Yes' : 'No' },
              ] : []),
            ]} />
          )}
          {legacy && (
            <p className="mt-4 text-[13px] text-text-secondary">
              This vendor joined before subscriptions existed and stays visible without paying. Starting a trial enrols them now,
              one vendor at a time; the policy for these vendors hasn’t been decided yet.
            </p>
          )}
        </Card>
      </div>

      <Card title="Payments" padded={false}>
        {!b ? <div className="p-5"><Skeleton className="h-12 w-full" /></div> : b.payments.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <Table label="Payments">
            <thead><tr><th>Date</th><th>Method</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead>
            <tbody>
              {b.payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDay(p.createdAt)}</td>
                  <td>{p.provider === 'daraja' ? 'M-Pesa' : 'Card'}</td>
                  <td>{formatMoney(p.amountMinor, p.currency)}</td>
                  <td><Badge tone={p.status === 'succeeded' ? 'success' : p.status === 'pending' || p.status === 'initiated' ? 'warning' : 'error'}>{ATTEMPT_LABEL[p.status]}</Badge>{p.requiresReview && <span className="ml-1.5"><Badge tone="warning">Needs review</Badge></span>}</td>
                  <td className="text-text-secondary">{p.providerReceipt ?? p.providerReference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card title="Invoices" padded={false}>
        {!b ? <div className="p-5"><Skeleton className="h-12 w-full" /></div> : b.invoices.length === 0 ? (
          <EmptyState title="No invoices yet" />
        ) : (
          <Table label="Invoices">
            <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {b.invoices.map((i) => (
                <tr key={i.id}>
                  <td>{formatDay(i.periodStart)} – {formatDay(i.periodEnd)}</td>
                  <td>{formatMoney(i.amountMinor, i.currency)}</td>
                  <td><Badge tone={i.status === 'paid' ? 'success' : i.status === 'open' ? 'warning' : 'neutral'}>{i.status === 'paid' ? 'Paid' : i.status === 'open' ? 'Due' : 'Void'}</Badge></td>
                  <td>{formatDay(i.dueAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {action && (
        <ConfirmDialog
          title={action === 'suspend' ? `Suspend ${v.businessName}?` : action === 'reinstate' ? `Reinstate ${v.businessName}?` : `Start a free trial for ${v.businessName}?`}
          tone={action === 'suspend' ? 'danger' : 'primary'}
          confirmLabel={action === 'suspend' ? 'Suspend vendor' : action === 'reinstate' ? 'Reinstate vendor' : 'Start free trial'}
          busyLabel="Saving…" busy={busy} error={actionError} confirmDisabled={reasonInvalid}
          onConfirm={() => void run()} onClose={() => { setAction(null); setActionError(null); setReason(''); }}>
          {action === 'enrol' ? (
            <p>A one-month free trial starts now. When it ends they are billed at the active price, if one is set.</p>
          ) : (
            <>
              <p>{action === 'suspend'
                ? 'Their listings are hidden and they can’t make changes. Existing bookings and billing stay available. This is recorded in the audit log.'
                : 'Their account becomes active again. Listings show again if their subscription allows it.'}</p>
              <label htmlFor="mod-reason" className="block mt-4 text-[13px] font-semibold text-text-primary">Reason <span className="font-normal text-text-secondary">(optional, audit log only)</span></label>
              <textarea id="mod-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-border-strong px-3 py-2 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" />
              {reasonInvalid && <p className="mt-1 text-[12px] text-error">A reason needs at least 5 characters, or leave it empty.</p>}
            </>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
