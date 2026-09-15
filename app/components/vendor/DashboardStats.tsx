// components/vendor/dashboard/DashboardStats.tsx
// ✅ Server Component — no 'use client', fetches on the server
// Colors: `brand` / `brand-hover` / `brand-tint` come from tailwind.config.ts

import { Calendar, Clock, Package, TrendingUp } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { getServerApiUrl } from '../../lib/api/server';

interface Stats {
  totalBookings:    number;
  pendingBookings:  number;
  totalListings:    number;
  completedRevenue: number;
}

// The API isn't consistent about response shape — some endpoints return
// `{ data: [...] }`, others paginate as `{ data: { data: [...], meta } }`.
// VendorBookingsPage already works around this on the client; this is the
// same normalization so `.length` never silently becomes `undefined`.
function unwrapList(json: any): any[] {
  const data = json?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function fetchStats(token: string): Promise<Stats> {
  const API = getServerApiUrl();
  const headers = { Authorization: `Bearer ${token}` };

  const [bookingsRes, listingsRes] = await Promise.allSettled([
    fetch(`${API}/bookings/vendor`, { headers, next: { revalidate: 60 } }),
    fetch(`${API}/listings/me`,     { headers, next: { revalidate: 60 } }),
  ]);

  let bookings: any[] = [];
  if (bookingsRes.status === 'fulfilled') {
    if (bookingsRes.value.ok) {
      bookings = unwrapList(await bookingsRes.value.json());
    } else {
      console.error('[DashboardStats] /bookings/vendor failed:', bookingsRes.value.status);
    }
  } else {
    console.error('[DashboardStats] /bookings/vendor errored:', bookingsRes.reason);
  }

  let listings: any[] = [];
  if (listingsRes.status === 'fulfilled') {
    if (listingsRes.value.ok) {
      listings = unwrapList(await listingsRes.value.json());
    } else {
      console.error('[DashboardStats] /listings/me failed:', listingsRes.value.status);
    }
  } else {
    console.error('[DashboardStats] /listings/me errored:', listingsRes.reason);
  }

  return {
    totalBookings:    bookings.length,
    pendingBookings:  bookings.filter(b => b.status === 'pending').length,
    totalListings:    listings.length,
    completedRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.totalAmount ?? 0), 0),
  };
}

export async function DashboardStats({ token }: { token: string }) {
  const stats = await fetchStats(token);

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