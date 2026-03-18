// components/admin/AdminTopbar.tsx — update PAGE_TITLES to match new URLs
'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell, Shield } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/vendors':   'Vendor Management',
  '/admin/listings':  'Listings',
  '/admin/bookings':  'Bookings',
  '/admin/analytics': 'Analytics',
};

export function AdminTopbar({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] ?? 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC] border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <button onClick={onMobileMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl
          hover:bg-white border border-transparent hover:border-gray-200 transition text-gray-600">
        <Menu size={16} />
      </button>
      <div className="flex items-center gap-2 flex-1">
        <Shield size={14} className="text-indigo-500" />
        <h1 className="text-sm font-black text-gray-800">{title}</h1>
      </div>
      <button className="w-8 h-8 flex items-center justify-center rounded-xl
        hover:bg-white border border-transparent hover:border-gray-200 transition text-gray-500">
        <Bell size={15} />
      </button>
    </header>
  );
}