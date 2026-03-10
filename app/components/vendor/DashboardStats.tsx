// components/vendor/dashboard/DashboardStats.tsx
// ✅ Server Component — no 'use client', fetches on the server

import { Calendar, Clock, Package, TrendingUp } from 'lucide-react';

interface Stats {
  totalBookings:    number;
  pendingBookings:  number;
  totalListings:    number;
  completedRevenue: number;
}

async function fetchStats(token: string): Promise<Stats> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  const headers = { Authorization: `Bearer ${token}` };

  const [bookingsRes, listingsRes] = await Promise.allSettled([
    fetch(`${API}/bookings/vendor`, { headers, next: { revalidate: 60 } }),
    fetch(`${API}/listings/me`,     { headers, next: { revalidate: 60 } }),
  ]);

  const bookings: any[] = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok
    ? ((await bookingsRes.value.json()).data ?? []) : [];

  const listings: any[] = listingsRes.status === 'fulfilled' && listingsRes.value.ok
    ? ((await listingsRes.value.json()).data ?? []) : [];

  return {
    totalBookings:    bookings.length,
    pendingBookings:  bookings.filter(b => b.status === 'pending').length,
    totalListings:    listings.length,
    completedRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.totalAmount ?? 0), 0),
  };
}

interface CardProps {
  label:   string;
  value:   string | number;
  note?:   string;
  accent:  string;
  icon:    React.ElementType;
}

function StatCard({ label, value, note, accent, icon: Icon }: CardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${accent}`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{value}</div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
      {note && <div className="text-[11px] text-gray-400 mt-0.5">{note}</div>}
    </div>
  );
}

export async function DashboardStats({ token }: { token: string }) {
  const stats = await fetchStats(token);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total Bookings"
        value={stats.totalBookings}
        icon={Calendar}
        accent="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        label="Pending"
        value={stats.pendingBookings}
        note={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'}
        icon={Clock}
        accent="bg-amber-50 text-amber-600"
      />
      <StatCard
        label="My Listings"
        value={stats.totalListings}
        icon={Package}
        accent="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        label="Revenue (KSh)"
        value={`${Math.round(stats.completedRevenue / 1000)}K`}
        note="Completed bookings"
        icon={TrendingUp}
        accent="bg-purple-50 text-purple-600"
      />
    </div>
  );
}