'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';
import Image from 'next/image';
import {
  LayoutDashboard, Calendar, BarChart3,
  Users, LogOut, User, Settings, ShoppingBag,
  X, Heart, Menu,
} from 'lucide-react';

type Role = 'customer' | 'vendor' | 'admin';
interface NavItem { href: string; label: string; Icon: React.ElementType; }

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: '/vendor/dashboard',        label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/vendor/bookings',         label: 'Bookings',  Icon: Calendar        },
    { href: '/vendor/analytics',        label: 'Analytics', Icon: BarChart3       },
    { href: '/vendor/settings/account', label: 'Account',   Icon: User            },
    { href: '/vendor/settings/profile', label: 'Business',  Icon: Settings        },
  ],
  admin: [
    { href: '/admin/dashboard',        label: 'Dashboard',  Icon: LayoutDashboard },
    { href: '/admin/vendors',          label: 'Vendors',    Icon: Users           },
    { href: '/admin/bookings',         label: 'Bookings',   Icon: Calendar        },
    { href: '/admin/analytics',        label: 'Analytics',  Icon: BarChart3       },
    { href: '/admin/categories',       label: 'Categories', Icon: Settings        },
    { href: '/admin/settings/account', label: 'Account',    Icon: User            },
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
  /** Set true when the parent topbar already renders its own mobile menu button,
   *  so Sidebar doesn't render a second, overlapping one. */
  hideOwnToggle?: boolean;
}

export function Sidebar({ mobileOpen, onMobileOpen, onMobileClose, hideOwnToggle = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const profile           = useProfile();
  const pathname          = usePathname();
  const role              = (user?.role ?? 'customer') as Role;
  const navItems          = NAV[role] ?? NAV.customer;

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">

      <div className="flex items-center justify-between px-1 mb-8">
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart Logo"
            width={120} height={28} className="h-7 w-auto" priority />
        </Link>
        <button onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:bg-surface-muted transition">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onMobileClose}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold transition-colors
                ${active
                  ? 'bg-accent-bg text-brand'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'}`}>
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-2 pb-1">
        <Link href="/store" onClick={onMobileClose}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold
            text-text-muted hover:text-brand hover:bg-accent-bg transition-colors">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      <button onClick={() => { logout(); onMobileClose(); }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold
          text-text-muted hover:text-error hover:bg-error-bg transition-colors w-full">
        <LogOut size={15} className="shrink-0" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {!hideOwnToggle && !mobileOpen && (
        <button onClick={onMobileOpen} aria-label="Open menu"
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center
            shadow-sm bg-card border border-border">
          <Menu size={18} className="text-text-secondary" />
        </button>
      )}

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-40 bg-card border-r border-border">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-[220px] z-50 lg:hidden bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}