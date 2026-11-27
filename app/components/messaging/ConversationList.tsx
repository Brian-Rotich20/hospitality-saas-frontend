'use client';

// Inbox list. GET /conversations has no counterpart name for vendors, so the list is joined
// client-side with the caller's own booking list (same account, at most 100 rows each).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { bookingsService } from '../../lib/api/endpoints';
import { useAuth } from '../../lib/auth/auth.context';
import { isUnread, useSeen } from '../../lib/messaging/unread';
import { formatDateRange } from '../../lib/bookings/booking-ui';
import type { BookingSummary } from '../../lib/types/booking';
import type { ConversationSummary } from '../../lib/types/messaging';

export interface BookingInfo { counterpart: string; dates: string }

/** bookingId → counterpart name and dates, from the caller's own bookings. */
export function useBookingIndex(enabled: boolean) {
  const { user } = useAuth();
  const [index, setIndex] = useState<Record<string, BookingInfo>>({});
  useEffect(() => {
    if (!enabled || !user || user.role === 'admin') return;
    let cancelled = false;
    const call = user.role === 'vendor' ? bookingsService.getVendorBookings({ limit: 100 }) : bookingsService.getMyBookings({ limit: 100 });
    call.then((res) => {
      if (cancelled) return;
      const map: Record<string, BookingInfo> = {};
      for (const b of (Array.isArray(res.data) ? res.data : []) as BookingSummary[]) {
        map[b.id] = {
          counterpart: (user.role === 'vendor' ? b.customer?.fullName : b.vendor?.businessName) ?? '',
          dates: formatDateRange(b.startDate, b.endDate),
        };
      }
      setIndex(map);
    }).catch(() => { /* names fall back to the listing title */ });
    return () => { cancelled = true; };
  }, [enabled, user]);
  return index;
}

export function counterpartName(c: ConversationSummary, info: BookingInfo | undefined, role: string | undefined) {
  if (info?.counterpart) return info.counterpart;
  return role === 'vendor' ? 'Customer' : c.businessName;
}

const when = (iso: string) => formatDistanceToNowStrict(new Date(iso), { addSuffix: true });

interface Props {
  items: ConversationSummary[] | null;
  error: boolean;
  onRetry: () => void;
  activeId?: string;
  index: Record<string, BookingInfo>;
}

export function ConversationList({ items, error, onRetry, activeId, index }: Props) {
  const { user } = useAuth();
  const seen = useSeen();

  if (items === null && !error) {
    return (
      <ul className="divide-y divide-gray-100" aria-busy="true" aria-label="Loading conversations">
        {[0, 1, 2].map((i) => (
          <li key={i} className="px-4 py-3.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 animate-pulse mb-2" />
            <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
          </li>
        ))}
      </ul>
    );
  }

  if (error && !items) {
    return (
      <div role="alert" className="p-5 text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs text-red-700 mb-2"><AlertCircle size={13} aria-hidden /> Could not load conversations.</p>
        <button onClick={onRetry} className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-gray-900">
          <RefreshCw size={12} aria-hidden /> Retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <MessageSquare size={28} className="mx-auto mb-3 text-gray-300" aria-hidden />
        <p className="text-sm font-semibold text-gray-800 mb-1">No conversations yet</p>
        <p className="text-xs text-gray-500 max-w-[36ch] mx-auto mb-4">
          A conversation opens when {user?.role === 'vendor' ? 'you accept a booking request' : 'a vendor accepts your booking request'}.
        </p>
        <Link href={user?.role === 'vendor' ? '/vendor/bookings' : '/customer/bookings'}
          className="text-xs font-bold text-ink underline underline-offset-2">
          Go to bookings
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((c) => {
        const info = index[c.bookingId];
        const unread = isUnread(c, seen) && c.id !== activeId;
        const closed = c.bookingStatus !== 'accepted' && c.bookingStatus !== 'completed';
        return (
          <li key={c.id}>
            <Link href={`/messages/${c.id}`} aria-current={c.id === activeId ? 'page' : undefined}
              className={`flex gap-3 px-4 py-3.5 no-underline transition-colors ${c.id === activeId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
              <span className="mt-1.5 w-2 shrink-0" aria-hidden>
                {unread && <span className="block w-2 h-2 rounded-full bg-brand" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`text-[13px] truncate ${unread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>
                    {counterpartName(c, info, user?.role)}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                    {c.lastMessageAt ? when(c.lastMessageAt) : 'No messages'}
                  </span>
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {c.listingTitle}{info?.dates ? ` · ${info.dates}` : ''}
                </span>
                {closed && <span className="block text-[11px] text-gray-400 mt-0.5">Booking {c.bookingStatus} · read only</span>}
                {unread && <span className="sr-only">Unread messages</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
