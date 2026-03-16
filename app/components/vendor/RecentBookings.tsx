// components/vendor/dashboard/RecentBookings.tsx
// ✅ Server Component

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

const STATUS: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  declined:  'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  completed: 'bg-purple-50 text-purple-700',
};

const DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-emerald-500',
  declined:  'bg-red-500',
  cancelled: 'bg-gray-500',
  completed: 'bg-purple-500',
};

async function fetchRecentBookings(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/bookings/vendor?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export async function RecentBookings({ token }: { token: string }) {
  const bookings = await fetchRecentBookings(token);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Bookings</p>
        <Link href="/vendor/bookings"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 no-underline">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 mb-1">No bookings yet</p>
          <p className="text-xs text-gray-400 mb-4">Create a listing to start receiving bookings</p>
          <Link href="/vendor/listings/new"
            className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition no-underline inline-block">
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