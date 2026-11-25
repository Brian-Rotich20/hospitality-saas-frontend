'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { bookingsService } from '../../../lib/api/endpoints';
import type { BookingStatus, BookingSummary } from '../../../lib/types/booking';
import { bookingErrorMessage, deadlineLabel, formatDateRange, statusMeta } from '../../../lib/bookings/booking-ui';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { BookingStatusBadge } from '../../../components/bookings/BookingStatusBadge';
import { Calendar, ChevronRight, ShoppingBag, AlertCircle, RefreshCw, Store, Clock, Users } from 'lucide-react';

type Filter = 'all' | BookingStatus;
const FILTERS: Filter[] = ['all', 'requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled'];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<Filter>('all');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await bookingsService.getMyBookings({ limit: 100, ...(filter !== 'all' ? { status: filter } : {}) });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(bookingErrorMessage(err, 'Could not load your bookings.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-0.5">My Bookings</h1>
        <p className="text-sm text-gray-500">Track your requests. Vendors reply within 24 hours.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Filter by status">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors
              ${filter === f
                ? 'bg-[#2D3B45] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2D3B45]'}`}>
            {f === 'all' ? 'All' : statusMeta(f).label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" aria-hidden />
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <button onClick={() => void load()}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800">
            <RefreshCw size={11} aria-hidden /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? null : bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <ShoppingBag size={24} className="text-gray-200 mx-auto mb-3" aria-hidden />
          <p className="text-sm font-bold text-gray-600 mb-1">No bookings found</p>
          <p className="text-xs text-gray-400 mb-4">
            {filter !== 'all' ? 'No bookings with this status.' : 'Find a service you like and send a booking request.'}
          </p>
          <Link href="/store"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition no-underline">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map(b => {
            const deadline = b.status === 'requested' ? deadlineLabel(b.respondBy) : null;
            return (
              <Link key={b.id} href={`/customer/bookings/${b.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                  flex items-center gap-4 hover:shadow-md transition-shadow no-underline group">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {b.listing?.coverPhoto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={b.listing.coverPhoto} alt="" className="w-full h-full object-cover
                        group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={16} className="text-gray-300" aria-hidden />
                      </div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate mb-0.5">
                    {b.listing?.title ?? 'Service'}
                  </p>
                  {b.vendor?.businessName && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-1 truncate">
                      <Store size={9} className="shrink-0" aria-hidden /> {b.vendor.businessName}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span><Calendar size={9} className="inline mr-1" aria-hidden />{formatDateRange(b.startDate, b.endDate)}</span>
                    <span><Users size={9} className="inline mr-1" aria-hidden />{b.guests.toLocaleString()}</span>
                    {deadline && <span className="text-amber-700 font-semibold"><Clock size={9} className="inline mr-1" aria-hidden />Reply due {deadline}</span>}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <BookingStatusBadge status={b.status} />
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-[#2D3B45] transition-colors" aria-hidden />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
