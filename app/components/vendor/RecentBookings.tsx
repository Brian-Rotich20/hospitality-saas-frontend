// components/vendor/RecentBookings.tsx
// Server Component.

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { serverFetch } from '../../lib/api/server';
import type { BookingSummary } from '../../lib/types/booking';
import { formatDateRange } from '../../lib/bookings/booking-ui';
import { BookingStatusBadge } from '../bookings/BookingStatusBadge';

export async function RecentBookings() {
  const { data, error } = await serverFetch<BookingSummary[]>('/bookings/vendor?limit=5');
  if (error) {
    console.error('[RecentBookings] /bookings/vendor failed:', error);
  }
  const bookings = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Bookings</p>
        <Link href="/vendor/bookings"
          className="text-xs font-bold text-brand hover:opacity-70 flex items-center gap-1 no-underline">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {error ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-bold text-gray-700 mb-1">Bookings could not be loaded</p>
          <p className="text-xs text-gray-400">Refresh the page to try again.</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">No bookings yet</p>
          <p className="text-xs text-gray-400 mb-4">Publish a listing to start receiving booking requests</p>
          <Link href="/vendor/listings/new"
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition no-underline inline-block">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {bookings.map((b, i) => (
            <Link key={b.id} href={`/vendor/bookings/${b.id}`}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 no-underline hover:bg-gray-50 transition-colors ${i < bookings.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {b.listing?.coverPhoto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={b.listing.coverPhoto} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={14} className="text-gray-300" />
                      </div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[220px]">
                    {b.listing?.title ?? 'Booking'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {formatDateRange(b.startDate, b.endDate)}
                    {b.customer?.fullName ? ` · ${b.customer.fullName}` : ''}
                  </p>
                </div>
              </div>
              <BookingStatusBadge status={b.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
