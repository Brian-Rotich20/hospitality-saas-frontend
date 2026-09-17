// components/vendor/dashboard/RecentBookings.tsx
// ✅ Server Component

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { serverFetch } from '../../lib/api/server';

const STATUS: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-brand-tint text-brand',
  declined:  'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  completed: 'bg-slate-100 text-slate-700',
};

const DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-brand',
  declined:  'bg-red-500',
  cancelled: 'bg-gray-500',
  completed: 'bg-slate-500',
};

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray((value as any)?.data)) return (value as any).data;
  return [];
}

export async function RecentBookings() {
  const { data, error } = await serverFetch<any>('/bookings/vendor?limit=5');
  if (error) {
    console.error('[RecentBookings] /bookings/vendor failed:', error);
  }
  const bookings = asArray(data);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Bookings</p>
        <Link href="/vendor/bookings"
          className="text-xs font-bold text-brand hover:opacity-70 flex items-center gap-1 no-underline">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">No bookings yet</p>
          <p className="text-xs text-gray-400 mb-4">Create a listing to start receiving bookings</p>
          <Link href="/vendor/listings/new"
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition no-underline inline-block">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {bookings.map((b: any, i: number) => (
            <div key={b.id}
              className={`flex items-center justify-between px-5 py-3.5 ${i < bookings.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {b.listing?.photos?.[0]
                    ? <img src={b.listing.photos[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={14} className="text-gray-300" />
                      </div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                    {b.listing?.title ?? 'Booking'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(b.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    {b.customer?.fullName ? ` · ${b.customer.fullName}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS[b.status] ?? STATUS.pending}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[b.status] ?? DOT.pending}`} />
                  {b.status}
                </span>
                <span className="text-xs font-black text-gray-900">
                  KSh {(b.totalAmount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}