// components/vendor/dashboard/DashboardStats.tsx
// ✅ Server Component
// Uses serverFetch() — the same cookie-forwarding Better Auth session used by
// VendorListingsPage. There is no client-visible access_token under Better
// Auth, so the previous `Authorization: Bearer ${token}` approach was
// silently 401ing on every request (see server.ts's own comment on this).

import { Calendar, Clock, Package, TrendingUp } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { serverFetch } from '../../lib/api/server';

interface Stats {
  totalBookings:    number;
  pendingBookings:  number;
  totalListings:    number;
  completedRevenue: number;
}

// serverFetch already unwraps one level (`json.data ?? json`), but some
// endpoints paginate a level deeper: { data: { data: [...], meta } }.
// This normalizes both shapes so `.length`/`.filter` never blow up.
function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray((value as any)?.data)) return (value as any).data;
  return [];
}

async function fetchStats(): Promise<Stats> {
  const [bookingsRes, listingsRes] = await Promise.all([
    serverFetch<any>('/bookings/vendor'),
    serverFetch<any>('/listings/me'),
  ]);

  if (bookingsRes.error) {
    console.error('[DashboardStats] /bookings/vendor failed:', bookingsRes.error);
  }
  if (listingsRes.error) {
    console.error('[DashboardStats] /listings/me failed:', listingsRes.error);
  }

  const bookings = asArray(bookingsRes.data);
  const listings = asArray(listingsRes.data);

  return {
    totalBookings:    bookings.length,
    pendingBookings:  bookings.filter(b => b.status === 'pending').length,
    totalListings:    listings.length,
    completedRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.totalAmount ?? 0), 0),
  };
}

export async function DashboardStats() {
  const stats = await fetchStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <StatCard label="Total Bookings" value={stats.totalBookings} icon={Calendar} />
      <StatCard
        label="Pending"
        value={stats.pendingBookings}
        note={stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'}
        icon={Clock}
        urgent={stats.pendingBookings > 0}
      />
      <StatCard label="My Listings" value={stats.totalListings} icon={Package} />
      <StatCard
        label="Revenue (KSh)"
        value={`${Math.round(stats.completedRevenue / 1000)}K`}
        note="Completed bookings"
        icon={TrendingUp}
      />
    </div>
  );
}