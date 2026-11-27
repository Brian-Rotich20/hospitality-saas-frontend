'use client';

// Customer home: requests still waiting for a vendor (with the vendor's deadline) and
// bookings coming up. Data: GET /bookings/me (the customer's own bookings).

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { bookingsService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { useAuth } from '../../../lib/auth/auth.context';
import { deadlineLabel, formatDateRange, todayInNairobi } from '../../../lib/bookings/booking-ui';
import type { BookingSummary } from '../../../lib/types/booking';
import { Card, EmptyState, Notice, PageHeader, Skeleton } from '../../../components/ui/Surface';
import { Button, ButtonLink } from '../../../components/ui/Button';

function Row({ b, waiting }: { b: BookingSummary; waiting?: boolean }) {
  const left = waiting ? deadlineLabel(b.respondBy) : null;
  return (
    <li>
      <Link href={`/customer/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3.5 no-underline hover:bg-page transition-colors">
        <div className="w-12 h-12 rounded-lg bg-surface-muted overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.listing?.coverPhoto && <img src={b.listing.coverPhoto} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-text-primary truncate">{b.listing?.title ?? 'Booking'}</p>
          <p className="text-[13px] text-text-secondary truncate">{b.vendor?.businessName ? `${b.vendor.businessName} · ` : ''}{formatDateRange(b.startDate, b.endDate)}</p>
        </div>
        {waiting && (
          <span className="shrink-0 flex items-center gap-1 text-[13px] font-semibold text-warning tabular">
            <Clock size={13} aria-hidden /> {left ? `Reply ${left}` : 'Reply due'}
          </span>
        )}
        <ChevronRight size={16} className="shrink-0 text-text-muted" aria-hidden />
      </Link>
    </li>
  );
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const today = useMemo(() => todayInNairobi(), []);
  const { data, error, loading, reload } = useLoad(() => bookingsService.getMyBookings({ limit: 100 }), []);
  const all = data ?? [];
  const waiting = all.filter((b) => b.status === 'requested');
  const upcoming = all.filter((b) => b.status === 'accepted' && b.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const first = user?.fullName?.split(' ')[0];

  return (
    <div className="max-w-[880px] mx-auto space-y-5">
      <PageHeader title={first ? `Hello, ${first}` : 'Your bookings'}
        description={loading && !data ? undefined
          : waiting.length ? `${waiting.length} request${waiting.length === 1 ? ' is' : 's are'} waiting for a vendor’s reply.`
          : upcoming.length ? `You have ${upcoming.length} upcoming booking${upcoming.length === 1 ? '' : 's'}.`
          : 'Find a venue or service and send a booking request.'}
        actions={<ButtonLink href="/store" variant="primary">Browse listings</ButtonLink>} />

      {error && <Notice tone="error" title="Could not load your bookings" action={<Button size="sm" variant="secondary" onClick={() => void reload()}>Retry</Button>} />}

      {loading && !data ? (
        <div className="space-y-4"><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-40 w-full rounded-2xl" /></div>
      ) : !error && all.length === 0 ? (
        <Card>
          <EmptyState title="No bookings yet" action={<ButtonLink href="/store" variant="primary">Browse listings</ButtonLink>}>
            Send a request to a vendor; they reply within 24 hours and you pay them directly.
          </EmptyState>
        </Card>
      ) : (
        <>
          {waiting.length > 0 && (
            <Card title="Waiting for a reply" description="Vendors have 24 hours to accept or decline." padded={false}>
              <ul className="divide-y divide-border">{waiting.map((b) => <Row key={b.id} b={b} waiting />)}</ul>
            </Card>
          )}
          <Card title="Coming up" padded={false}
            action={<Link href="/customer/bookings" className="text-[13px] font-semibold text-text-secondary hover:text-text-primary">All bookings</Link>}>
            {upcoming.length === 0
              ? <EmptyState title="Nothing coming up">Accepted bookings appear here until they’re over.</EmptyState>
              : <ul className="divide-y divide-border">{upcoming.slice(0, 5).map((b) => <Row key={b.id} b={b} />)}</ul>}
          </Card>
        </>
      )}
    </div>
  );
}
