'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';
import Image from 'next/image';
import {
  LayoutDashboard, Package, Calendar, BarChart3,
  Users, LogOut, User, Settings, ShoppingBag,
  ChevronRight, X, Heart, Menu,
} from 'lucide-react';

type Role = 'customer' | 'vendor' | 'admin';
interface NavItem { href: string; label: string; Icon: React.ElementType; }

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: '/vendor/dashboard',        label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/vendor/listings',         label: 'My Listings', Icon: Package         },
    { href: '/vendor/bookings',         label: 'Bookings',    Icon: Calendar        },
    { href: '/vendor/analytics',        label: 'Analytics',   Icon: BarChart3       },
    { href: '/vendor/settings/account', label: 'Account',     Icon: User            },
    { href: '/vendor/settings/profile', label: 'Business',    Icon: Settings        },
  ],
  admin: [
    { href: '/admin/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
    { href: '/admin/vendors',    label: 'Vendors',    Icon: Users           },
    { href: '/admin/listings',   label: 'Listings',   Icon: Package         },
    { href: '/admin/bookings',   label: 'Bookings',   Icon: Calendar        },
    { href: '/admin/analytics',  label: 'Analytics',  Icon: BarChart3       },
    { href: '/admin/categories', label: 'Categories', Icon: Settings        },
  ],
  customer: [
    { href: '/customer/dashboard',       label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/customer/bookings',        label: 'My Bookings', Icon: Calendar        },
    { href: '/customer/saved',           label: 'Saved',       Icon: Heart           },
    { href: '/customer/account/profile', label: 'Profile',     Icon: User            },
  ],
};

interface SidebarProps {
  mobileOpen:    boolean;
  onMobileOpen:  () => void;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const profile           = useProfile();
  const pathname          = usePathname();
  const role              = (user?.role ?? 'customer') as Role;
  const navItems          = NAV[role] ?? NAV.customer;

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  const accountHref =
    role === 'vendor' ? '/vendor/settings/account' :
    role === 'admin'  ? '/admin/dashboard'          : '/customer/account/profile';

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'User';
  const initial      = displayName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">

      {/* Logo */}
      <div className="flex items-center justify-between px-1 mb-8">
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart Logo"
            width={120} height={28} className="h-7 w-auto brightness-0 invert" priority />
        </Link>
        <button onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 transition">
          <X size={16} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold transition-colors
                ${active ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Browse store */}
      <div className="pt-2 pb-1">
        <Link href="/store" onClick={onMobileClose}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-400 hover:text-gray-200 hover:bg-white/5">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); onMobileClose(); }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-400 hover:text-red-400 hover:bg-white/5 w-full">
        <LogOut size={15} className="shrink-0" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Floating hamburger — mobile only */}
      {!mobileOpen && (
        <button
          onClick={onMobileOpen}
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: '#fff', border: '1px solid #E5E7EB' }}
          aria-label="Open menu"
        >
          <Menu size={18} color="#374151" />
        </button>
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-40 bg-[#17181C]">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed left-0 top-0 h-screen w-[220px] z-50 lg:hidden bg-[#17181C]
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}