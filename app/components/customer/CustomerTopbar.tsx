'use client';

import { usePathname } from 'next/navigation';
import { useAuth }     from '../../lib/auth/auth.context';
import { Menu, Bell }  from 'lucide-react';

const LABELS: Record<string, string> = {
  '/customer/dashboard': 'Dashboard',
  '/customer/bookings':  'My Bookings',
  '/customer/saved':     'Saved Listings',
  '/customer/ profile':   'My Profile',
};

function getLabel(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname];
  if (pathname.startsWith('/bookings/')) return 'Booking Detail';
  return 'My Account';
}

interface Props { onMobileMenuToggle: () => void; }

export function CustomerTopbar({ onMobileMenuToggle }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const label    = getLabel(pathname);
  const initial  = (user?.fullName ?? user?.email ?? 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100
      px-4 h-14 flex items-center justify-between">

      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button onClick={onMobileMenuToggle}
          className="lg:hidden w-8 h-8 rounded-xl border border-gray-200 flex items-center
            justify-center text-gray-600 hover:border-gray-400 transition-colors">
          <Menu size={16} />
        </button>
        <h2 className="text-sm font-black text-gray-900 tracking-tight">{label}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-8 h-8 rounded-full border border-gray-200 flex
          items-center justify-center text-gray-400 hover:border-[#2D3B45] transition-colors">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F5C842]
            rounded-full border border-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#2D3B45] flex items-center justify-center">
          <span className="text-[#F5C842] text-xs font-black">{initial}</span>
        </div>
      </div>
    </header>
  );
}