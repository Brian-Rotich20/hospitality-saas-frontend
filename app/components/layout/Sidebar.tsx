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
  X, Heart, Menu,
} from 'lucide-react';

// Color system: primary green #085F19 · mint tint #EAF7F5 · page bg #F7F9FB
// White sidebar/cards, gray for secondary text/icons — green is reserved for
// active/selected state and primary actions only.

type Role = 'customer' | 'vendor' | 'admin';
interface NavItem { href: string; label: string; Icon: React.ElementType; }

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: '/vendor/dashboard',        label: 'Home',   Icon: LayoutDashboard },
    { href: '/vendor/listings',         label: 'My Listings', Icon: Package         },
    { href: '/vendor/bookings',         label: 'Bookings',    Icon: Calendar        },
    { href: '/vendor/analytics',        label: 'Analytics',   Icon: BarChart3       },
    { href: '/vendor/settings/account', label: 'Account',     Icon: User            },
    { href: '/vendor/settings/profile', label: 'Business',    Icon: Settings        },
  ],
  admin: [
    { href: '/admin/dashboard',  label: 'Home',  Icon: LayoutDashboard },
    { href: '/admin/vendors',    label: 'Vendors',    Icon: Users           },
    { href: '/admin/listings',   label: 'Listings',   Icon: Package         },
    { href: '/admin/bookings',   label: 'Bookings',   Icon: Calendar        },
    { href: '/admin/analytics',  label: 'Analytics',  Icon: BarChart3       },
    { href: '/admin/categories', label: 'Categories', Icon: Settings        },
  ],
  customer: [
    { href: '/customer/dashboard',       label: 'Home',   Icon: LayoutDashboard },
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">

      {/* Logo */}
      <div className="flex items-center justify-between px-1 mb-8">
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart Logo"
            width={120} height={28} className="h-7 w-auto" priority />
        </Link>
        <button onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-50 transition">
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
                ${active
                  ? 'bg-[#EAF7F5] text-[#085F19]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Browse store */}
      <div className="pt-2 pb-1">
        <Link href="/store" onClick={onMobileClose}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-500 hover:text-[#085F19] hover:bg-[#EAF7F5] transition-colors">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout — destructive action, stays red regardless of brand palette */}
      <button onClick={() => { logout(); onMobileClose(); }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full">
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
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-white border border-gray-200"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-gray-700" />
        </button>
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-40 bg-white border-r border-gray-100">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed left-0 top-0 h-screen w-[220px] z-50 lg:hidden bg-white border-r border-gray-100
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}