'use client';

import Link      from 'next/link';
import Image     from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth }     from '../../lib/auth/auth.context';
import {
  LayoutDashboard, Calendar, Heart,
  User, ShoppingBag, LogOut, ChevronRight, X,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/bookings',   label: 'My Bookings',  Icon: Calendar        },
  { href: '/saved',      label: 'Saved',         Icon: Heart           },
  { href: '/profile',    label: 'Profile',       Icon: User            },
];

interface Props {
  mobileOpen:    boolean;
  onMobileClose: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <Link href="/store" className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28}
            className="h-7 w-auto" priority />
        </Link>
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center transition">
            <X size={15} />
          </button>
        )}
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-[#2D3B45] flex items-center justify-center shrink-0">
            <span className="text-[#F5C842] text-xs font-black">
              {(user?.fullName ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user?.fullName ?? user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-gray-400">Customer</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold
                no-underline transition-colors
                ${active
                  ? 'bg-[#2D3B45] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Browse store */}
      <div className="px-3 pb-2">
        <Link href="/store" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold
            text-gray-400 hover:bg-gray-100 hover:text-gray-700 no-underline transition-colors">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-1 border-t border-gray-100">
        <button onClick={() => { logout(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold
            text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function CustomerSidebar({ mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56
        bg-white border-r border-gray-100 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100
        z-50 lg:hidden transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onClose={onMobileClose} />
      </aside>
    </>
  );
}