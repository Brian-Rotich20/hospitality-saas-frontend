export const dynamic = 'force-dynamic';

import { serverFetch } from '../../../lib/api/server';
import Link            from 'next/link';
import { StatCard }    from '../../../components/ui/StatCard';
import { Users, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';

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
      <div className="mb-8">
        <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-sm text-text-muted">Platform overview and pending actions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Vendors" value={stats.totalVendors} icon={Users} />
        <StatCard
          label="Pending Approval"
          value={stats.pendingVendors}
          icon={Clock}
          urgent={stats.pendingVendors > 0}
          actionHref="/admin/vendors"
        />
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={Calendar} />
        <StatCard label="Revenue (KSh)" value={`${Math.round(stats.revenue / 1000)}K`} icon={TrendingUp} />
      </div>

      <div className="mb-8">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Pending Vendors', href: '/admin/vendors',  primary: true  },
            { label: 'All Vendors',     href: '/admin/vendors',  primary: false },
            { label: 'All Bookings',    href: '/admin/bookings', primary: false },
          ].map(({ label, href, primary }) => (
            <Link key={label} href={href}
              className={`px-4 py-2 rounded-xl text-xs font-bold no-underline transition-colors
                ${primary
                  ? 'bg-brand text-white hover:bg-brand-hover'
                  : 'bg-card text-text-secondary border border-border hover:border-brand'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {stats.pendingVendors > 0 && (
        <div className="flex items-start gap-3 bg-accent-bg border border-accent rounded-2xl p-5">
          <AlertCircle size={16} className="text-brand shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-brand mb-0.5">
              {stats.pendingVendors} vendor{stats.pendingVendors > 1 ? 's' : ''} waiting for approval
            </p>
            <p className="text-xs text-text-secondary">Review and approve to let them start listing.</p>
          </div>
          <Link href="/admin/vendors"
            className="px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-xl
              hover:bg-brand-hover transition no-underline shrink-0">
            Review
          </Link>
        </div>
      )}
    </div>
  );
}