'use client';

import { useState, useEffect } from 'react';
import Link   from 'next/link';
import { useAuth }        from '../.././../lib/auth/auth.context';
import { customerService, bookingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  Calendar, Heart, ShoppingBag, TrendingUp,
  Clock, CheckCircle, XCircle, ChevronRight,
  MapPin, AlertCircle,
} from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400'   },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-500'    },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'    },
  declined:  { label: 'Declined',  color: 'bg-red-50 text-red-500',       dot: 'bg-red-400'     },
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      customerService.getStats(),
      bookingsService.getMyBookings({ limit: 5 }),
    ]).then(([statsRes, bookingsRes]) => {
      setStats((statsRes as any).data);
      const bd = (bookingsRes as any).data;
      setBookings(Array.isArray(bd) ? bd.slice(0, 5) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const name = user?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  const statCards = [
    {
      label: 'Total Bookings', value: stats?.total ?? 0,
      Icon: Calendar, accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending',  value: stats?.pending ?? 0,
      Icon: Clock,       accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Completed', value: stats?.completed ?? 0,
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
        <p className="text-sm text-gray-500">Here's a summary of your activity.</p>
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

      {/* Total spent */}
      {stats?.spent > 0 && (
        <div className="bg-[#2D3B45] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
              Total Spent
            </p>
            <p className="text-2xl font-black text-white">
              KSh {stats.spent.toLocaleString()}
            </p>
          </div>
          <TrendingUp size={32} className="text-[#F5C842] opacity-80" />
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
            { label: 'My Bookings',     href: '/bookings', primary: false },
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
          <Link href="/bookings"
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
              Explore services and make your first booking.
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
              const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
              const location = b.listing?.location;
              const locationStr = [location?.area, location?.county].filter(Boolean).join(', ');
              return (
                <Link key={b.id} href={`/bookings/${b.id}`}
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
                    {locationStr && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {locationStr}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold
                      px-2 py-0.5 rounded-full ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
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