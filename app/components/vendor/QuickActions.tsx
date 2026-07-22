// components/vendor/dashboard/QuickActions.tsx
// ✅ Client Component — only interactive links, no data fetching
// Color system: primary green #085F19 · mint tint #EAF7F5 · page bg #F7F9FB
'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

const ACTIONS = [
  { label: 'New Listing',   href: '/vendor/listings/new', primary: true  },
  { label: 'View Bookings', href: '/vendor/bookings',     primary: false },
  { label: 'My Listings',   href: '/vendor/listings',     primary: false },
  { label: 'Analytics',     href: '/vendor/analytics',    primary: false },
];

export function QuickActions() {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ label, href, primary }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold no-underline transition-colors
              ${primary
                ? 'bg-[#085F19] text-white hover:bg-[#0a7a21]'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#085F19] hover:text-[#085F19]'
              }`}>
            {primary && <Plus size={13} />}
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}