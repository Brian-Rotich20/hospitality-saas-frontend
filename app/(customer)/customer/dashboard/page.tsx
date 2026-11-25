'use client';

import { useState, useEffect } from 'react';
import Link   from 'next/link';
import { useAuth }        from '../.././../lib/auth/auth.context';
import { customerService, bookingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type { BookingSummary } from '../../../lib/types/booking';
import { formatDateRange } from '../../../lib/bookings/booking-ui';
import { BookingStatusBadge } from '../../../components/bookings/BookingStatusBadge';
import { Calendar, Heart, ShoppingBag, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

/** GET /users/me/stats: booking counts per status (no money fields). */
interface CustomerStats {
  total: number; requested: number; accepted: number; completed: number;
  declined: number; expired: number; cancelled: number; savedCount: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState<CustomerStats | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [failed,   setFailed]   = useState(false);

  useEffect(() => {
    // Independent requests: one failing should not blank the other.
    void Promise.allSettled([
      customerService.getStats(),
      bookingsService.getMyBookings({ limit: 5 }),
    ]).then(([statsRes, bookingsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data as CustomerStats);
      if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data)) setBookings(bookingsRes.value.data);
      setFailed(statsRes.status === 'rejected' || bookingsRes.status === 'rejected');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const name = user?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  const statCards = [
    {
      label: 'Total Bookings', value: stats?.total ?? 0,
      Icon: Calendar, accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Awaiting reply', value: stats?.requested ?? 0,
      Icon: Clock,       accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Accepted', value: stats?.accepted ?? 0,
      Icon: CheckCircle,  accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Saved',   value: stats?.savedCount ?? 0,
      Icon: Heart,      accent: 'bg-pink-50 text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-0.5">
          {greeting()}, {name} 👋
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s a summary of your activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, Icon, accent }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${accent}`}>
              <Icon size={15} />
            </div>
            <div className="text-2xl font-black text-gray-900 leading-none mb-1">{value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {label}
            </div>
          </div>
        ))}
      </div>

      {failed && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-2" role="alert">
          <AlertCircle size={14} className="text-amber-500" aria-hidden />
          <p className="text-xs text-amber-800">Some of your activity could not be loaded. Refresh the page to try again.</p>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Browse Services', href: '/store',    primary: true  },
            { label: 'My Bookings',     href: '/customer/bookings', primary: false },
            { label: 'Saved Listings',  href: '/saved',    primary: false },
          ].map(({ label, href, primary }) => (
            <Link key={label} href={href}
              className={`px-4 py-2 rounded-xl text-xs font-bold no-underline transition-colors
                ${primary
                  ? 'bg-[#2D3B45] text-white hover:bg-[#3a4d5a]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#2D3B45]'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Recent Bookings
          </p>
          <Link href="/customer/bookings"
            className="text-[11px] font-bold text-[#2D3B45] hover:underline no-underline
              flex items-center gap-1">
            View all <ChevronRight size={11} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
            <ShoppingBag size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600 mb-1">No bookings yet</p>
            <p className="text-xs text-gray-400 mb-4">
              Explore services and send your first booking request.
            </p>
            <Link href="/store"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D3B45] text-white
                text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition no-underline">
              <ShoppingBag size={12} /> Browse Services
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {bookings.map((b, i) => {
              return (
                <Link key={b.id} href={`/customer/bookings/${b.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 no-underline
                    hover:bg-gray-50 transition-colors
                    ${i < bookings.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  {/* Cover */}
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {b.listing?.coverPhoto
                      ? <img src={b.listing.coverPhoto} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Calendar size={14} className="text-gray-300" />
                        </div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {b.listing?.title ?? 'Listing'}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={9} aria-hidden /> {formatDateRange(b.startDate, b.endDate)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <BookingStatusBadge status={b.status} />
                    <span className="text-[10px] text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}