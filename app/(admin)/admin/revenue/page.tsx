'use client';

// Subscription revenue from the append-only revenue journal: GET /admin/subscriptions/revenue?from&to
// (to is exclusive). Booking money never appears here because LinkMart never handles it.

import { useMemo, useState } from 'react';
import { adminBillingService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { formatMoney } from '../../../lib/subscriptions/subscription-ui';
import { todayInNairobi } from '../../../lib/bookings/booking-ui';
import { addDaysYmd } from '../../../lib/availability/availability-ui';
import { Card, Notice, PageHeader, Table } from '../../../components/ui/Surface';
import { LoadState } from '../../../components/admin/AdminList';

const LABEL = { subscription_payment: 'Subscription payments', refund: 'Refunds', reversal: 'Reversals' } as const;

export default function AdminRevenuePage() {
  const today = useMemo(() => todayInNairobi(), []);
  const [from, setFrom] = useState(`${today.slice(0, 8)}01`);
  const [to, setTo] = useState(today);
  const valid = from <= to;
  const { data, error, loading, reload } = useLoad(
    () => (valid ? adminBillingService.revenue(from, addDaysYmd(to, 1)) : Promise.resolve({ data: [] })),
    [from, to, valid],
  );
  const rows = data ?? [];
  const net = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.currency] = (acc[r.currency] ?? 0) + (r.entryType === 'subscription_payment' ? r.totalMinor : -Math.abs(r.totalMinor));
    return acc;
  }, {});
  const review = rows.reduce((n, r) => n + r.needsReview, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Revenue" description="Subscription income recorded after each payment is verified with the provider." />

      <Card>
        <form className="flex flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
          <label><span className="block text-[13px] font-semibold mb-1.5">From</span>
            <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)}
              className="h-10 rounded-[10px] border border-border-strong px-3 text-[14px] outline-none focus:border-ink" /></label>
          <label><span className="block text-[13px] font-semibold mb-1.5">To</span>
            <input type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)}
              className="h-10 rounded-[10px] border border-border-strong px-3 text-[14px] outline-none focus:border-ink" /></label>
          <p className="text-[13px] text-text-secondary pb-2.5">Dates are inclusive.</p>
        </form>
      </Card>

      {!valid && <Notice tone="error" title="The start date must be on or before the end date." />}
      {review > 0 && <Notice tone="warning" title={`${review} entr${review === 1 ? 'y needs' : 'ies need'} review`}>Check them under Payments before relying on these totals.</Notice>}

      <Card padded={false} title="Summary">
        <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()}
          emptyTitle="No revenue in this period" emptyText="Nothing was received or reversed between these dates.">
          <Table label="Revenue summary">
            <thead><tr><th>Type</th><th>Entries</th><th>Total</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.currency}-${r.entryType}`}>
                  <td>{LABEL[r.entryType] ?? r.entryType}</td>
                  <td>{r.count}</td>
                  <td className="font-medium">{formatMoney(Math.abs(r.totalMinor), r.currency)}</td>
                </tr>
              ))}
              {Object.entries(net).map(([cur, total]) => (
                <tr key={`net-${cur}`}>
                  <td className="font-semibold">Net</td><td />
                  <td className="font-bold">{total < 0 ? '−' : ''}{formatMoney(Math.abs(total), cur)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </LoadState>
      </Card>
    </div>
  );
}
