'use client';

// Subscription payment investigation (read-mostly). GET /admin/payments with filters,
// POST /admin/payments/:id/review { note 5–2000 } closes a review flag, and
// POST /admin/payments/:id/reverify asks the provider again. Neither moves money or changes access.

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminBillingService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import { useLoad } from '../../../lib/hooks/useLoad';
import type { AdminPaymentRow } from '../../../lib/types/subscription';
import { ATTEMPT_LABEL, formatMoney } from '../../../lib/subscriptions/subscription-ui';
import { formatTimestamp } from '../../../lib/bookings/booking-ui';
import { Badge, Card, PageHeader, Table } from '../../../components/ui/Surface';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { FilterTabs, LoadState, PAGE_SIZE, Pager } from '../../../components/admin/AdminList';

type Filter = 'review' | 'all' | 'succeeded' | 'pending' | 'failed';
const REASONS: Record<string, string> = {
  amount_or_currency_mismatch: 'Amount or currency mismatch', reference_mismatch: 'Reference mismatch',
  paid_settled_invoice: 'Paid an invoice that was already settled', provider_reversal: 'Reversed by the provider',
  provider_partial_refund: 'Partial refund at the provider', additional_reversal_not_journaled: 'Extra reversal not recorded',
  reversal_of_uncredited_payment: 'Reversal of a payment never credited', reversal_currency_mismatch: 'Reversal currency mismatch',
  provider_dispute: 'Disputed at the provider',
};
const tone = (s: string) => (s === 'succeeded' ? 'success' : s === 'pending' || s === 'initiated' ? 'warning' : s === 'reversed' ? 'info' : 'error');

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState<Filter>('review');
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(
    () => adminBillingService.payments({
      ...(filter === 'review' ? { needsReview: true } : filter === 'all' ? {} : { status: filter }),
      limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE,
    }),
    [filter, page],
  );
  const rows = (data ?? []).slice(0, PAGE_SIZE);
  const [reviewing, setReviewing] = useState<AdminPaymentRow | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const reverify = async (p: AdminPaymentRow) => {
    if (busy) return;
    setBusy(p.id);
    try {
      const res = await adminBillingService.reverify(p.id);
      const status = (res.data as unknown as { status?: string })?.status;
      toast.success(status ? `Provider says: ${ATTEMPT_LABEL[status as keyof typeof ATTEMPT_LABEL] ?? status}` : 'Re-checked with the provider');
      await reload();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.code === 'NOT_VERIFIABLE' ? 'This payment can’t be re-checked with the provider.' : e.message || 'Re-check failed.');
    } finally {
      setBusy(null);
    }
  };

  const closeReview = async () => {
    if (!reviewing || busy) return;
    setBusy(reviewing.id);
    setDialogError(null);
    try {
      await adminBillingService.review(reviewing.id, note.trim());
      toast.success('Review closed');
      setReviewing(null);
      setNote('');
      await reload();
    } catch (err) {
      const e = err as ApiError;
      setDialogError(e.code === 'NO_OPEN_REVIEW' ? 'This payment has no open review.' : e.message || 'Could not close the review.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader title="Payments" description="Subscription payments by card and M-Pesa. Reviews record what you found; they never move money or change a vendor’s access." />
      <FilterTabs label="Filter payments" value={filter} onChange={(v) => { setFilter(v); setPage(0); }}
        options={[{ value: 'review', label: 'Needs review' }, { value: 'all', label: 'All' }, { value: 'succeeded', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }]} />
      <Card padded={false}>
        <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()}
          emptyTitle={filter === 'review' ? 'Nothing needs review' : 'No payments here'}
          emptyText={filter === 'review' ? 'Payments that need a person (mismatches, reversals, disputes) appear here.' : undefined}>
          <Table label="Payments">
            <thead><tr><th>Date</th><th>Vendor</th><th>Method</th><th>Amount</th><th>Status</th><th>Reference</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap">{formatTimestamp(p.createdAt)}</td>
                  <td><Link href={`/admin/vendors/${p.vendorId}`} className="font-semibold hover:underline underline-offset-2">{p.businessName}</Link></td>
                  <td>{p.provider === 'daraja' ? 'M-Pesa' : 'Card'}</td>
                  <td className="whitespace-nowrap">{formatMoney(p.amountMinor, p.currency)}</td>
                  <td>
                    <Badge tone={tone(p.status)}>{ATTEMPT_LABEL[p.status]}</Badge>
                    {p.requiresReview && !p.reviewedAt && <span className="block mt-1 text-[12px] text-warning">{REASONS[p.reviewReason ?? ''] ?? 'Needs review'}</span>}
                  </td>
                  <td className="text-text-secondary">{p.providerReceipt ?? p.providerReference ?? '—'}</td>
                  <td className="text-right whitespace-nowrap">
                    {(p.status === 'pending' || p.status === 'initiated' || (p.requiresReview && !p.reviewedAt)) && (
                      <Button size="sm" variant="ghost" loading={busy === p.id} onClick={() => void reverify(p)}>Re-check</Button>
                    )}
                    {p.requiresReview && !p.reviewedAt && (
                      <Button size="sm" variant="secondary" onClick={() => { setDialogError(null); setNote(''); setReviewing(p); }}>Close review</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pager page={page} hasNext={(data?.length ?? 0) > PAGE_SIZE} onPage={setPage} shown={rows.length} />
        </LoadState>
      </Card>

      {reviewing && (
        <ConfirmDialog title="Close this review" confirmLabel="Close review" busyLabel="Saving…"
          busy={busy === reviewing.id} error={dialogError} confirmDisabled={note.trim().length < 5}
          onConfirm={() => void closeReview()} onClose={() => setReviewing(null)}>
          <p>{reviewing.businessName} · {formatMoney(reviewing.amountMinor, reviewing.currency)} · {REASONS[reviewing.reviewReason ?? ''] ?? 'Needs review'}</p>
          <label htmlFor="review-note" className="block mt-4 text-[13px] font-semibold text-text-primary">What did you find?</label>
          <textarea id="review-note" rows={4} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-border-strong px-3 py-2 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" />
          <p className="mt-1 text-[12px] text-text-muted">At least 5 characters. Recorded in the audit log.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
