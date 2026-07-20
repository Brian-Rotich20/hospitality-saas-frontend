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
    <div className="bg-white rounded-[22px] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500">
          <span className={`inline-flex p-1 rounded-lg ${accent}`}>
            <Icon size={13} />
          </span>
          {label}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[26px] font-black text-gray-900 tracking-tight leading-none">{value}</span>
        {note && <span className="text-[10px] text-gray-400 text-right">{note}</span>}
      </div>
    </div>
  );
}

export async function DashboardStats({ token }: { token: string }) {
  const stats = await fetchStats(token);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <StatCard
        label="Total Bookings"
        value={stats.totalBookings}
        icon={Calendar}
        accent="bg-[#EFEAFB] text-[#8B7FF0]"
      />
      <StatCard
        label="Pending"
        value={stats.pendingBookings}
        note={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'}
        icon={Clock}
        accent="bg-[#FBF3D9] text-[#B08900]"
      />
      <StatCard
        label="My Listings"
        value={stats.totalListings}
        icon={Package}
        accent="bg-[#EAF7D4] text-[#5C8A1E]"
      />
      <StatCard
        label="Revenue (KSh)"
        value={`${Math.round(stats.completedRevenue / 1000)}K`}
        note="Completed bookings"
        icon={TrendingUp}
        accent="bg-[#EFEAFB] text-[#8B7FF0]"
      />
    </div>
  );
}