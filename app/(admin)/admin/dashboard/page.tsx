export const dynamic = 'force-dynamic';

import { serverFetch } from '../../../lib/api/server';
import Link            from 'next/link';
import { StatCard }    from '../../../components/ui/StatCard';
import { Users, Calendar, TrendingUp, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [{ data: vendors }, { data: bookings }] = await Promise.all([
    serverFetch('/admin/vendors'),
    serverFetch('/admin/bookings'),
  ]);

  const v = Array.isArray(vendors) ? vendors : [];
  const b = Array.isArray(bookings) ? bookings : [];

  const stats = {
    totalVendors:   v.length,
    pendingVendors: v.filter((x: any) => x.status === 'pending').length,
    totalBookings:  b.length,
    revenue:        b.filter((x: any) => x.status === 'completed')
                     .reduce((s: number, x: any) => s + (x.totalAmount ?? 0), 0),
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-text-muted">Platform overview and pending actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Vendors" value={stats.totalVendors} icon={Users} />
        <StatCard
          label="Pending Approval"
          value={stats.pendingVendors}
          icon={Clock}
          urgent={stats.pendingVendors > 0}
          actionHref="/admin/vendors"
          actionLabel="Review vendors"
        />
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={Calendar} />
        <StatCard label="Revenue (KSh)" value={`${Math.round(stats.revenue / 1000)}K`} icon={TrendingUp} />
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/vendors"
            className="px-4 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
              bg-ink text-white hover:bg-ink-hover">
            Pending Vendors
          </Link>
          <Link href="/admin/vendors"
            className="px-4 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
              bg-card text-text-secondary border border-border hover:border-text-primary hover:text-text-primary">
            All Vendors
          </Link>
          <Link href="/admin/bookings"
            className="px-4 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
              bg-card text-text-secondary border border-border hover:border-text-primary hover:text-text-primary">
            All Bookings
          </Link>
        </div>
      </div>

      {stats.pendingVendors > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card border border-border rounded-2xl p-5">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent-bg text-brand shrink-0">
            <AlertCircle size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary mb-0.5">
              {stats.pendingVendors} vendor{stats.pendingVendors > 1 ? 's' : ''} waiting for approval
            </p>
            <p className="text-xs text-text-muted">Review and approve to let them start listing.</p>
          </div>
          <Link href="/admin/vendors"
            className="inline-flex items-center gap-1 px-3.5 py-2 bg-ink text-white text-xs font-bold rounded-xl
              hover:bg-ink-hover transition no-underline shrink-0 whitespace-nowrap">
            Review <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}