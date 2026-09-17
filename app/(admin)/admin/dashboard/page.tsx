export const dynamic = 'force-dynamic';

import { serverFetch } from '../../../lib/api/server';
import Link            from 'next/link';
import { StatCard }    from '../../../components/ui/StatCard';
import { Users, Calendar, TrendingUp, UserRound } from 'lucide-react';

export default async function AdminDashboardPage() {
  // NOTE: adjust '/admin/customers' if your actual endpoint for the customer
  // list/count is named differently (e.g. /admin/users?role=customer).
  const [{ data: vendors }, { data: bookings }, { data: customers }] = await Promise.all([
    serverFetch('/admin/vendors'),
    serverFetch('/admin/bookings'),
    serverFetch('/admin/customers'),
  ]);

  const v = Array.isArray(vendors) ? vendors : [];
  const b = Array.isArray(bookings) ? bookings : [];
  const c = Array.isArray(customers) ? customers : [];

  const stats = {
    totalVendors:   v.length,
    totalCustomers: c.length,
    totalBookings:  b.length,
    revenue:        b.filter((x: any) => x.status === 'completed')
                     .reduce((s: number, x: any) => s + (x.totalAmount ?? 0), 0),
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-text-muted">Platform overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Vendors" value={stats.totalVendors} icon={Users} />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={UserRound} />
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={Calendar} />
        <StatCard label="Revenue (KSh)" value={`${Math.round(stats.revenue / 1000)}K`} icon={TrendingUp} />
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/vendors"
            className="px-4 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
              bg-ink text-white hover:bg-ink-hover">
            All Vendors
          </Link>
          <Link href="/admin/bookings"
            className="px-4 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
              bg-card text-text-secondary border border-border hover:border-text-primary hover:text-text-primary">
            All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}