// app/(admin)/admin-dashboard/page.tsx
// ✅ Server Component — fetches stats server-side
export const dynamic = 'force-dynamic';

import { cookies }          from 'next/headers';
import Link                 from 'next/link';
import { 
  Users, Package, Calendar, TrendingUp,
  Clock, CheckCircle, AlertCircle, ArrowRight,
} from 'lucide-react';

async function fetchAdminStats(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  const h   = { Authorization: `Bearer ${token}` };
  try {
    const [vendorsRes, bookingsRes] = await Promise.allSettled([
      fetch(`${API}/admin/vendors`,          { headers: h, cache: 'no-store' }),
      fetch(`${API}/admin/bookings`,         { headers: h, cache: 'no-store' }),
    ]);

    const vendors  = vendorsRes.status  === 'fulfilled' && vendorsRes.value.ok
      ? (await vendorsRes.value.json()).data  ?? [] : [];
    const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok
      ? (await bookingsRes.value.json()).data ?? [] : [];

    return {
      totalVendors:    vendors.length,
      pendingVendors:  vendors.filter((v: any) => v.status === 'pending').length,
      approvedVendors: vendors.filter((v: any) => v.status === 'approved').length,
      totalBookings:   bookings.length,
      revenue:         bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((s: number, b: any) => s + (b.totalAmount ?? 0), 0),
    };
  } catch {
    return { totalVendors: 0, pendingVendors: 0, approvedVendors: 0, totalBookings: 0, revenue: 0 };
  }
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get('access_token')?.value ?? '';
  const stats       = await fetchAdminStats(token);

  const cards = [
    { label: 'Total Vendors',   value: stats.totalVendors,   icon: Users,        accent: 'bg-indigo-50 text-indigo-600'  },
    { label: 'Pending Approval',value: stats.pendingVendors, icon: Clock,        accent: 'bg-amber-50 text-amber-600',
      urgent: stats.pendingVendors > 0, href: '/admin/vendors?tab=pending' },
    { label: 'Total Bookings',  value: stats.totalBookings,  icon: Calendar,     accent: 'bg-emerald-50 text-emerald-600' },
    { label: 'Revenue (KSh)',   value: `${Math.round(stats.revenue / 1000)}K`,
      icon: TrendingUp, accent: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and pending actions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, accent, urgent, href }) => (
          <div key={label}
            className={`bg-white border rounded-2xl p-5 ${urgent ? 'border-amber-200' : 'border-gray-100'}`}>
            <div className={`inline-flex p-2 rounded-xl mb-3 ${accent}`}>
              <Icon size={16} />
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
            {urgent && href && (
              <Link href={href}
                className="mt-2 text-[10px] font-bold text-amber-600 flex items-center gap-1 no-underline hover:text-amber-800">
                Review now <ArrowRight size={10} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Pending Vendors',  href: '/admin/vendors?tab=pending',  primary: true  },
            { label: 'All Vendors',      href: '/admin/vendors',               primary: false },
            { label: 'All Bookings',     href: '/admin/bookings',              primary: false },
          ].map(({ label, href, primary }) => (
            <Link key={href} href={href}
              className={`px-4 py-2 rounded-xl text-xs font-bold no-underline transition-colors
                ${primary
                  ? 'bg-[#2D3B45] text-white hover:bg-[#3a4d5a]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#2D3B45]'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Pending vendors alert */}
      {stats.pendingVendors > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 mb-0.5">
              {stats.pendingVendors} vendor{stats.pendingVendors > 1 ? 's' : ''} waiting for approval
            </p>
            <p className="text-xs text-amber-700">Review and approve vendor applications to let them start listing.</p>
          </div>
          <Link href="/admin/vendors?tab=pending"
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl
              hover:bg-amber-600 transition no-underline shrink-0">
            Review
          </Link>
        </div>
      )}
    </div>
  );
}