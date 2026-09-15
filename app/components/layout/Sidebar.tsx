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
interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  badge?: string;
}

const NAV: Record<Role, { primary: NavItem[]; general: NavItem[] }> = {
  vendor: {
    primary: [
      { href: '/vendor/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { href: '/vendor/bookings',  label: 'Bookings',  Icon: Calendar        },
      { href: '/vendor/analytics', label: 'Analytics', Icon: BarChart3       },
    ],
    general: [
      { href: '/vendor/settings/account', label: 'Account',      Icon: User        },
      { href: '/vendor/settings/profile', label: 'Business',     Icon: Settings    },
      { href: '/store',                   label: 'Browse Store', Icon: ShoppingBag },
    ],
  },
  admin: {
    primary: [
      { href: '/admin/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
      { href: '/admin/vendors',    label: 'Vendors',    Icon: Users           },
      { href: '/admin/bookings',   label: 'Bookings',   Icon: Calendar        },
      { href: '/admin/analytics',  label: 'Analytics',  Icon: BarChart3       },
      { href: '/admin/categories', label: 'Categories', Icon: Settings        },
    ],
    general: [
      { href: '/admin/settings/account', label: 'Account', Icon: User },
    ],
  },
  customer: {
    primary: [
      { href: '/customer/dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
      { href: '/customer/bookings',  label: 'My Bookings', Icon: Calendar        },
      { href: '/customer/saved',     label: 'Saved',       Icon: Heart           },
    ],
    general: [
      { href: '/customer/account/profile', label: 'Profile',      Icon: User        },
      { href: '/store',                    label: 'Browse Store', Icon: ShoppingBag },
    ],
  },
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  hideOwnToggle?: boolean;
}

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const { href, label, Icon, badge } = item;
  return (
    <div className="relative">
      {active && (
        <span className="absolute -left-5 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-text-primary" />
      )}
      <Link href={href} onClick={onClick}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors
          ${active
            ? 'bg-surface-muted text-text-primary'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'}`}>
        <Icon size={15} className="shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {badge && (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-text-primary text-white shrink-0">
            {badge}
          </span>
        )}
      </Link>
    </div>
  );
}

export function Sidebar({ mobileOpen, onMobileOpen, onMobileClose, hideOwnToggle = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const profile  = useProfile();
  const pathname = usePathname();
  const role     = (user?.role ?? 'customer') as Role;
  const { primary, general } = NAV[role] ?? NAV.customer;

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">

      <div className="flex items-center justify-between px-1 mb-7">
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart Logo"
            width={110} height={26} className="h-6 w-auto" priority />
        </Link>
        <button onClick={onMobileClose} aria-label="Close menu"
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:bg-surface-muted transition">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto pl-2 -ml-2 space-y-6">

        <div>
          <p className="section-label px-3.5 mb-2">Overview</p>
          <div className="space-y-0.5">
            {primary.map(item => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={onMobileClose} />
            ))}
          </div>
        </div>

        <div>
          <p className="section-label px-3.5 mb-2">General</p>
          <div className="space-y-0.5">
            {general.map(item => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={onMobileClose} />
            ))}
            <button onClick={() => { logout(); onMobileClose(); }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold
                text-text-muted hover:text-error hover:bg-error-bg transition-colors w-full">
              <LogOut size={15} className="shrink-0" />
              Logout
            </button>
          </div>
        </div>

      </nav>

      {/* Promo slot — neutral ink card, no orange */}
      <div className="mt-4 rounded-2xl bg-ink p-4 relative overflow-hidden">
        {/* <Sparkles size={15} className="text-white/70 mb-2" /> */}
        <p className="text-white text-[12.5px] font-bold leading-snug mb-0.5">
          {role === 'vendor' ? 'Grow your listings' : 'Discover new vendors'}
        </p>
        <p className="text-white/55 text-[10.5px] leading-snug mb-3">
          {role === 'vendor' ? 'Add photos to boost visibility' : 'Fresh services added weekly'}
        </p>
        <Link href={role === 'vendor' ? '/vendor/listings' : '/store'} onClick={onMobileClose}
          className="block text-center py-2 rounded-full bg-white text-text-primary text-[11px] font-bold no-underline hover:opacity-90 transition-opacity">
          {role === 'vendor' ? 'Manage listings' : 'Browse now'}
        </Link>
      </div>
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

      <aside className={`fixed left-0 top-0 h-screen w-[220px] max-w-[85vw] z-50 lg:hidden bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}