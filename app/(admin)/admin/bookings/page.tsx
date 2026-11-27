'use client';

// All booking requests (read-only). GET /admin/bookings?status&limit&offset.
// Bookings carry no money: LinkMart never prices, charges or settles them.

import { useState } from 'react';
import { adminService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import type { BookingStatus, BookingSummary } from '../../../lib/types/booking';
import { formatDateRange, formatTimestamp, statusMeta } from '../../../lib/bookings/booking-ui';
import { Badge, Card, PageHeader, Table } from '../../../components/ui/Surface';
import { FilterTabs, LoadState, PAGE_SIZE, Pager } from '../../../components/admin/AdminList';

type Filter = 'all' | BookingStatus;
const TONE: Record<BookingStatus, 'warning' | 'success' | 'error' | 'neutral' | 'info'> = {
  requested: 'warning', accepted: 'success', declined: 'error', expired: 'neutral', cancelled: 'neutral', completed: 'info',
};

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(
    () => adminService.getAllBookings({ ...(filter === 'all' ? {} : { status: filter }), limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE }) as Promise<{ data: BookingSummary[] }>,
    [filter, page],
  );
  const rows = (data ?? []).slice(0, PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Bookings" description="Every booking request across LinkMart. Customers pay vendors directly; nothing here is charged." />
      <FilterTabs label="Filter bookings" value={filter} onChange={(v) => { setFilter(v); setPage(0); }}
        options={[
          { value: 'all', label: 'All' }, { value: 'requested', label: 'Awaiting reply' }, { value: 'accepted', label: 'Accepted' },
          { value: 'completed', label: 'Completed' }, { value: 'declined', label: 'Declined' }, { value: 'expired', label: 'Expired' },
          { value: 'cancelled', label: 'Cancelled' },
        ]} />
      <Card padded={false}>
        <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()}
          emptyTitle={filter === 'all' ? 'No booking requests yet' : 'No bookings with this status'}>
          <Table label="Bookings">
            <thead><tr><th>Listing</th><th>Customer</th><th>Dates</th><th>Guests</th><th>Status</th><th>Requested</th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold max-w-[260px] truncate">{b.listing?.title ?? '—'}</td>
                  <td>{b.customer?.fullName ?? '—'}</td>
                  <td className="whitespace-nowrap">{formatDateRange(b.startDate, b.endDate)}</td>
                  <td>{b.guests.toLocaleString()}</td>
                  <td><Badge tone={TONE[b.status] ?? 'neutral'} dot>{statusMeta(b.status).label}</Badge></td>
                  <td className="whitespace-nowrap text-text-secondary">{formatTimestamp(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pager page={page} hasNext={(data?.length ?? 0) > PAGE_SIZE} onPage={setPage} shown={rows.length} />
        </LoadState>
      </Card>
    </div>
  );
}
