// components/vendor/VendorTopbar.tsx
// ✅ Client Component — mobile hamburger + page title + notifications

'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/vendor/dashboard': 'Dashboard',
  '/vendor/listings':  'My Listings',
  '/vendor/bookings':  'Bookings',
  '/vendor/analytics': 'Analytics',
  '/vendor/settings':  'Settings',
};

interface Props {
  onMobileMenuToggle: () => void;
}

export function VendorTopbar({ onMobileMenuToggle }: Props) {
  const pathname = usePathname();

  // Match the most specific route first
  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] ?? 'Vendor';

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC] border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl
          hover:bg-white border border-transparent hover:border-gray-200 transition text-gray-600">
        <Menu size={16} />
      </button>

      <h1 className="text-sm font-black text-gray-800 flex-1">{title}</h1>

      {/* Notification bell — placeholder */}
      <button className="w-8 h-8 flex items-center justify-center rounded-xl
        hover:bg-white border border-transparent hover:border-gray-200 transition text-gray-500">
        <Bell size={15} />
      </button>
    </header>
  );
}