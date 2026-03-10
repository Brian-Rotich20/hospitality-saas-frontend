// app/(vendor)/vendor/dashboard/page.tsx
// ✅ Server Component — NO 'use client'
// Auth already enforced by middleware — no useEffect auth check needed
// Data fetched server-side — no loading spinners, no useEffect

import { Suspense }       from 'react';
import { cookies }        from 'next/headers';
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[0,1,2,3].map(i => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
          <div className="w-9 h-9 bg-gray-100 rounded-xl mb-3" />
          <div className="h-7 bg-gray-100 rounded w-1/2 mb-1" />
          <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
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
  // access_token cookie: set by auth context after login (NOT httpOnly so client JS can set it)
  // Used here for server-side data fetching only — expires in 15 min matching access token lifetime
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
          {greeting()} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats — streamed from server */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats token={token} />
      </Suspense>

      {/* Quick actions — client links only */}
      <QuickActions />

      {/* Recent bookings — streamed from server */}
      <Suspense fallback={<BookingsSkeleton />}>
        <RecentBookings token={token} />
      </Suspense>
    </div>
  );
}