// app/(vendor)/vendor/dashboard/page.tsx
// Auth is handled per-request inside serverFetch() (forwards the Better Auth
// session cookie) — no token needs to be read or passed down from here.

import { Suspense }       from 'react';
import { ChevronDown }    from 'lucide-react';
import { DashboardStats } from '../../../components/vendor/DashboardStats';
import { RecentBookings } from '../../../components/vendor/RecentBookings';
import { QuickActions }   from '../../../components/vendor/QuickActions';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {[0,1,2,3].map(i => (
        <div key={i} className="bg-white rounded-[22px] p-4 animate-pulse">
          <div className="w-7 h-7 bg-gray-100 rounded-lg mb-3" />
          <div className="h-7 bg-gray-100 rounded w-1/2 mb-1" />
          <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="bg-white rounded-[22px] overflow-hidden">
      {[0,1,2].map(i => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 animate-pulse">
          <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export default async function VendorDashboardPage() {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-black text-gray-900 tracking-tight mb-1">
            {greeting()} 👋
          </h1>
          <p className="text-[12px] text-gray-400">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-gray-400 mb-1">{today}</p>
          <button className="bg-white border border-gray-100 rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 hover:border-brand hover:text-brand transition-colors">
            Today <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Stats — streamed from server */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Quick actions — client links only */}
      <QuickActions />

      {/* Recent bookings — streamed from server */}
      <Suspense fallback={<BookingsSkeleton />}>
        <RecentBookings />
      </Suspense>
    </div>
  );
}