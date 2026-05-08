'use client';

import { useState, useEffect } from 'react';
import Link   from 'next/link';
import { bookingsService } from '../.././../lib/api/endpoints';
import { LoadingSpinner }  from '../../../components/common/LoadingSpinner';
import {
  Calendar, MapPin, ChevronRight,
  ShoppingBag, AlertCircle, RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-400'   },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border border-blue-200',       dot: 'bg-blue-500'    },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border border-gray-200',     dot: 'bg-gray-400'    },
  declined:  { label: 'Declined',  color: 'bg-red-50 text-red-500 border border-red-200',         dot: 'bg-red-400'     },
};

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;
type Filter = typeof FILTERS[number];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<Filter>('all');

  const fetch = async () => {
    setLoading(true); setError(null);
    try {
      const res = await bookingsService.getMyBookings(
        filter !== 'all' ? { status: filter } : undefined
      );
      const data = (res as any).data;
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-0.5">My Bookings</h1>
        <p className="text-sm text-gray-500">Track and manage all your bookings.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap
              transition-colors capitalize
              ${filter === f
                ? 'bg-[#2D3B45] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2D3B45]'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <button onClick={fetch}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800">
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <ShoppingBag size={24} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600 mb-1">No bookings found</p>
          <p className="text-xs text-gray-400 mb-4">
            {filter !== 'all' ? 'No bookings with this status.' : 'You have no bookings yet.'}
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
            const sc       = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
            const location = b.listing?.location;
            const locStr   = [location?.area, location?.county].filter(Boolean).join(', ');
            const start    = new Date(b.startDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
            const end      = new Date(b.endDate).toLocaleDateString('en-KE',   { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <Link key={b.id} href={`/bookings/${b.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                  flex items-center gap-4 hover:shadow-md transition-shadow no-underline group">

                {/* Cover */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {b.listing?.coverPhoto
                    ? <img src={b.listing.coverPhoto} alt="" className="w-full h-full object-cover
                        group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={16} className="text-gray-300" />
                      </div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate mb-0.5">
                    {b.listing?.title ?? 'Service'}
                  </p>
                  {locStr && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-1">
                      <MapPin size={9} className="shrink-0" /> {locStr}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500">
                    <Calendar size={9} className="inline mr-1" />
                    {start} → {end}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold
                    px-2 py-1 rounded-full ${sc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  <p className="text-xs font-black text-[#2D3B45]">
                    KSh {parseFloat(b.totalAmount ?? '0').toLocaleString()}
                  </p>
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-[#2D3B45] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}