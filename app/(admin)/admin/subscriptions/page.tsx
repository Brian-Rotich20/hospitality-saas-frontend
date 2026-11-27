'use client';

// Subscription administration: the price (plans), every vendor's subscription, and vendors
// that joined before subscriptions existed. Creating a plan is the only way a price is set;
// with no active plan, billing is held and vendors stay visible (backend rule).

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminBillingService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import { useLoad } from '../../../lib/hooks/useLoad';
import type { Plan, SubscriptionStatus } from '../../../lib/types/subscription';
import { STATUS_LABEL, formatDay, formatMoney } from '../../../lib/subscriptions/subscription-ui';
import { Badge, Card, Notice, PageHeader, Skeleton, Table } from '../../../components/ui/Surface';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { FilterTabs, LoadState, PAGE_SIZE, Pager } from '../../../components/admin/AdminList';

const MAX_KES = 1_000_000;

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="The vendor subscription is LinkMart’s only charge. Set the price here and follow each vendor’s billing state." />
      <PlansSection />
      <SubscriptionsSection />
      <UnenrolledSection />
    </div>
  );
}

// ── Price ────────────────────────────────────────────────────────────────────
function PlansSection() {
  const plans = useLoad(() => adminBillingService.plans(), []);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [activate, setActivate] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'create' } | { kind: 'toggle'; plan: Plan } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const active = (plans.data ?? []).find((p) => p.isActive) ?? null;
  const shillings = Number(price);

  const validate = () => {
    if (name.trim().length < 2) return 'Give the plan a name of at least 2 characters.';
    if (!/^[a-z0-9_-]{2,50}$/.test(code)) return 'The code uses 2–50 lowercase letters, numbers, - or _.';
    if (!Number.isInteger(shillings) || shillings <= 0 || shillings > MAX_KES) return `Enter a whole number of shillings between 1 and ${MAX_KES.toLocaleString()}.`;
    return null;
  };

  const submit = () => {
    const problem = validate();
    setFormError(problem);
    if (!problem) { setDialogError(null); setConfirm({ kind: 'create' }); }
  };

  const run = async () => {
    if (!confirm || busy) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (confirm.kind === 'create') {
        await adminBillingService.createPlan({ code, name: name.trim(), amountMinor: shillings * 100, currency: 'KES', activate });
        toast.success(activate ? 'Price saved and activated' : 'Plan saved');
        setName(''); setCode(''); setPrice('');
      } else {
        await adminBillingService.setPlanActive(confirm.plan.id, !confirm.plan.isActive);
        toast.success(confirm.plan.isActive ? 'Plan deactivated' : 'Plan activated');
      }
      setConfirm(null);
      await plans.reload();
    } catch (err) {
      const e = err as ApiError;
      setDialogError(e.code === 'ALREADY_EXISTS' ? 'A plan with this code already exists.' : e.message || 'Could not save the plan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Price" description={active ? `Vendors are billed ${formatMoney(active.amountMinor, active.currency)} per ${active.interval}.` : 'No price is active, so vendors are not billed.'}>
      {!active && !plans.loading && (
        <div className="mb-5"><Notice tone="warning" title="No active price">Trials still end on schedule, but billing is held and vendors stay visible until a price is activated.</Notice></div>
      )}

      {plans.error ? <Notice tone="error" title="Could not load plans" action={<Button size="sm" variant="secondary" onClick={() => void plans.reload()}>Retry</Button>} />
        : plans.loading && !plans.data ? <Skeleton className="h-20 w-full" />
        : (plans.data ?? []).length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden mb-6">
            <Table label="Plans">
              <thead><tr><th>Plan</th><th>Code</th><th>Price</th><th>Status</th><th>Created</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {(plans.data ?? []).map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.name}</td>
                    <td className="text-text-secondary">{p.code}</td>
                    <td>{formatMoney(p.amountMinor, p.currency)} / {p.interval}</td>
                    <td>{p.isActive ? <Badge tone="success" dot>Active</Badge> : <Badge>Inactive</Badge>}</td>
                    <td>{formatDay(p.createdAt)}</td>
                    <td className="text-right">
                      <Button size="sm" variant={p.isActive ? 'ghost' : 'secondary'} onClick={() => { setDialogError(null); setConfirm({ kind: 'toggle', plan: p }); }}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate className="grid gap-4 sm:grid-cols-3">
        <h3 className="sm:col-span-3 text-[14px] font-semibold text-text-primary">New price</h3>
        <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Plan name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monthly listing" maxLength={100}
            className="w-full h-10 rounded-[10px] border border-border-strong px-3 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" /></label>
        <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Code</span>
          <input value={code} onChange={(e) => setCode(e.target.value.toLowerCase())} placeholder="monthly-2027" maxLength={50}
            className="w-full h-10 rounded-[10px] border border-border-strong px-3 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" /></label>
        <label className="block"><span className="block text-[13px] font-semibold mb-1.5">Price per month (KES)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="Whole shillings"
            className="w-full h-10 rounded-[10px] border border-border-strong px-3 text-[14px] tabular outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" /></label>
        <label className="sm:col-span-2 flex items-center gap-2.5 text-[14px] text-text-secondary">
          <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} className="w-4 h-4 accent-[#00831E]" />
          Make this the active price now
        </label>
        <div className="sm:text-right"><Button type="submit">Save price</Button></div>
        {formError && <p role="alert" className="sm:col-span-3 text-[13px] text-error">{formError}</p>}
      </form>

      {confirm && (
        <ConfirmDialog busy={busy} busyLabel="Saving…" error={dialogError}
          title={confirm.kind === 'create' ? (activate ? `Activate ${formatMoney(shillings * 100)} per month?` : 'Save this plan?')
            : confirm.plan.isActive ? `Deactivate ${confirm.plan.name}?` : `Activate ${confirm.plan.name}?`}
          confirmLabel={confirm.kind === 'create' ? (activate ? 'Save and activate' : 'Save plan') : confirm.plan.isActive ? 'Deactivate' : 'Activate'}
          tone={confirm.kind === 'toggle' && confirm.plan.isActive ? 'danger' : 'primary'}
          onConfirm={() => void run()} onClose={() => setConfirm(null)}>
          {(confirm.kind === 'create' ? activate : !confirm.plan.isActive)
            ? 'This replaces the current price. Invoices already issued keep their amount; each vendor’s next billing period uses the new price.'
            : confirm.kind === 'toggle'
              ? 'With no active price, billing is held: vendors aren’t invoiced and stay visible. Invoices already issued are unaffected.'
              : 'The plan is stored but not used until you activate it.'}
        </ConfirmDialog>
      )}
    </Card>
  );
}

// ── Vendor subscriptions ─────────────────────────────────────────────────────
type SubFilter = 'all' | SubscriptionStatus;
interface SubRow { id: string; vendorId: string; businessName: string; status: SubscriptionStatus; trialEndsAt: string; currentPeriodEnd: string | null; graceEndsAt: string | null; billingHoldReason: string | null }
const subTone = (s: string) => (s === 'trialing' || s === 'active' ? 'success' : s === 'past_due' ? 'warning' : 'error');

function SubscriptionsSection() {
  const [filter, setFilter] = useState<SubFilter>('all');
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(
    () => adminBillingService.subscriptions({ ...(filter === 'all' ? {} : { status: filter }), limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE }) as unknown as Promise<{ data: SubRow[] }>,
    [filter, page],
  );
  const rows = (data ?? []).slice(0, PAGE_SIZE);
  const nextDate = (r: SubRow) =>
    r.status === 'trialing' ? `Trial ends ${formatDay(r.trialEndsAt)}`
      : r.status === 'past_due' && r.graceEndsAt ? `Pay by ${formatDay(r.graceEndsAt)}`
      : r.currentPeriodEnd ? `Period ends ${formatDay(r.currentPeriodEnd)}` : '—';

  return (
    <Card title="Vendor subscriptions" padded={false}>
      <div className="px-5 pt-2">
        <FilterTabs label="Filter subscriptions" value={filter} onChange={(v) => { setFilter(v); setPage(0); }}
          options={[{ value: 'all', label: 'All' }, ...(['trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired'] as SubscriptionStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))]} />
      </div>
      <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()} emptyTitle="No subscriptions in this state">
        <Table label="Vendor subscriptions">
          <thead><tr><th>Vendor</th><th>Status</th><th>Next date</th><th>Billing</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/vendors/${r.vendorId}`} className="font-semibold text-text-primary hover:underline underline-offset-2">{r.businessName}</Link></td>
                <td><Badge tone={subTone(r.status)} dot>{STATUS_LABEL[r.status]}</Badge></td>
                <td>{nextDate(r)}</td>
                <td className="text-text-secondary">{r.billingHoldReason === 'no_active_plan' ? 'Held: no price set' : 'Normal'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager page={page} hasNext={(data?.length ?? 0) > PAGE_SIZE} onPage={setPage} shown={rows.length} />
      </LoadState>
    </Card>
  );
}

// ── Vendors from before subscriptions (decision D3 open) ─────────────────────
function UnenrolledSection() {
  const { data, error, loading, reload } = useLoad(() => adminBillingService.unenrolled(), []);
  if (!loading && !error && (data ?? []).length === 0) return null;
  return (
    <Card title="Not enrolled" description="Vendors who joined before subscriptions existed. They stay visible without paying until enrolled; open a vendor to start their trial." padded={false}>
      <LoadState loading={loading} error={error} empty={(data ?? []).length === 0} onRetry={() => void reload()} emptyTitle="Everyone is enrolled">
        <ul className="divide-y divide-border">
          {(data ?? []).map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="font-semibold text-[14px]">{v.businessName}</span>
              <Link href={`/admin/vendors/${v.id}`} className="text-[13px] font-semibold text-text-secondary hover:text-text-primary">Open</Link>
            </li>
          ))}
        </ul>
      </LoadState>
    </Card>
  );
}

