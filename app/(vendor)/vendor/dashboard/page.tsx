'use client';

// Vendor home, phone first: what needs a reply now (soonest deadline first), what is coming
// up, and the few facts worth glancing at. Every figure comes from the API:
// GET /bookings/vendor/pending, /bookings/vendor?status=accepted, /listings/me, /vendors/me.

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock, Plus } from 'lucide-react';
import { bookingsService, listingsService, vendorsService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { useConversations, isUnread, useSeen } from '../../../lib/messaging/unread';
import { deadlineLabel, formatDateRange, todayInNairobi } from '../../../lib/bookings/booking-ui';
import type { BookingSummary } from '../../../lib/types/booking';
import { Card, EmptyState, Notice, PageHeader, Skeleton } from '../../../components/ui/Surface';
import { Button, ButtonLink } from '../../../components/ui/Button';

interface VendorMe { businessName?: string; profileComplete?: boolean; missing?: string[] }
interface MyListing { id: string; status: string }

const MISSING_LABEL: Record<string, string> = { logo: 'a logo', 'phone number': 'a phone number', 'business name': 'a business name' };

function BookingRow({ b, deadline }: { b: BookingSummary; deadline?: boolean }) {
  const left = deadline ? deadlineLabel(b.respondBy) : null;
  const urgent = deadline && b.respondBy && new Date(b.respondBy).getTime() - Date.now() < 3 * 3600_000;
  return (
    <li>
      <Link href={`/vendor/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3.5 no-underline hover:bg-page transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-text-primary truncate">{b.customer?.fullName || 'Customer'} · {b.guests.toLocaleString()} guest{b.guests === 1 ? '' : 's'}</p>
          <p className="text-[13px] text-text-secondary truncate">{b.listing?.title} · {formatDateRange(b.startDate, b.endDate)}</p>
        </div>
        {deadline && (
          <span className={`shrink-0 flex items-center gap-1 text-[13px] font-semibold tabular ${urgent ? 'text-error' : 'text-warning'}`}>
            <Clock size={13} aria-hidden /> {left ? left.replace(/^in /, '') : 'Due now'}
          </span>
        )}
        <ChevronRight size={16} className="shrink-0 text-text-muted" aria-hidden />
      </Link>
    </li>
  );
}

export default function VendorDashboardPage() {
  const today = useMemo(() => todayInNairobi(), []);
  const pending = useLoad(() => bookingsService.getPending(), []);
  const accepted = useLoad(() => bookingsService.getVendorBookings({ status: 'accepted', limit: 100 }), []);
  const listings = useLoad(() => listingsService.getMyListings() as unknown as Promise<{ data: MyListing[] }>, []);
  const me = useLoad(() => vendorsService.getProfile() as unknown as Promise<{ data: VendorMe }>, []);
  const inbox = useConversations(true, 60_000);
  const seen = useSeen();

  const requests = pending.data ?? [];
  const upcoming = (accepted.data ?? []).filter((b) => b.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const live = (listings.data ?? []).filter((l) => l.status === 'active').length;
  const total = (listings.data ?? []).filter((l) => l.status !== 'deleted').length;
  const unread = (inbox.items ?? []).filter((c) => isUnread(c, seen)).length;
  const missing = me.data?.missing ?? [];
  const anyError = pending.error || accepted.error || listings.error;

  const title = pending.loading && !pending.data ? 'Today'
    : requests.length === 0 ? 'No requests waiting'
    : `${requests.length} request${requests.length === 1 ? '' : 's'} to answer`;

  return (
    <div className="max-w-[880px] mx-auto space-y-5">
      <PageHeader title={title}
        description={me.data?.businessName ? `${me.data.businessName} · ${new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' }).format(new Date())}` : undefined}
        actions={<ButtonLink href="/vendor/listings/new" variant="secondary"><Plus size={16} aria-hidden /> New listing</ButtonLink>} />

      {anyError && (
        <Notice tone="error" title="Some of your dashboard couldn’t be loaded"
          action={<Button size="sm" variant="secondary" onClick={() => { void pending.reload(); void accepted.reload(); void listings.reload(); }}>Retry</Button>} />
      )}

      {missing.length > 0 && (
        <Notice tone="info" title="Finish your business profile"
          action={<Link href="/vendor/settings/profile" className="text-[13px] font-semibold underline whitespace-nowrap">Add details</Link>}>
          Add {missing.map((m) => MISSING_LABEL[m] ?? m).join(' and ')} so customers can recognise and reach you.
        </Notice>
      )}

      <Card title="Waiting for your reply" description="Requests expire if you don’t accept or decline within 24 hours." padded={false}
        action={requests.length > 0 ? <Link href="/vendor/bookings" className="text-[13px] font-semibold text-text-secondary hover:text-text-primary">All bookings</Link> : undefined}>
        {pending.loading && !pending.data ? <div className="p-5 space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          : requests.length === 0 ? <EmptyState title="You’re up to date">New booking requests will appear here.</EmptyState>
          : <ul className="divide-y divide-border">{requests.slice(0, 6).map((b) => <BookingRow key={b.id} b={b} deadline />)}</ul>}
      </Card>

      <Card title="Coming up" padded={false}>
        {accepted.loading && !accepted.data ? <div className="p-5"><Skeleton className="h-10 w-full" /></div>
          : upcoming.length === 0 ? <EmptyState title="No upcoming bookings">Accepted bookings appear here until they’re over.</EmptyState>
          : <ul className="divide-y divide-border">{upcoming.slice(0, 5).map((b) => <BookingRow key={b.id} b={b} />)}</ul>}
      </Card>

      <section aria-label="At a glance" className="grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
        <Link href="/vendor/listings" className="bg-card px-5 py-4 no-underline hover:bg-page">
          <p className="text-[13px] text-text-secondary">Listings live</p>
          <p className="mt-0.5 text-[22px] font-bold text-text-primary tabular">{listings.data ? `${live} of ${total}` : '–'}</p>
        </Link>
        <Link href="/messages" className="bg-card px-5 py-4 no-underline hover:bg-page">
          <p className="text-[13px] text-text-secondary">Unread conversations</p>
          <p className={`mt-0.5 text-[22px] font-bold tabular ${unread ? 'text-brand' : 'text-text-primary'}`}>{inbox.items ? unread : '–'}</p>
        </Link>
        <Link href="/vendor/bookings" className="bg-card px-5 py-4 no-underline hover:bg-page col-span-2 sm:col-span-1">
          <p className="text-[13px] text-text-secondary">Upcoming bookings</p>
          <p className="mt-0.5 text-[22px] font-bold text-text-primary tabular">{accepted.data ? (accepted.data.length >= 100 ? '100+' : upcoming.length) : '–'}</p>
        </Link>
      </section>
    </div>
  );
}
