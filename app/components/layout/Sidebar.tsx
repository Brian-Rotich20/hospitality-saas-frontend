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
  ChevronRight, X, Heart,
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

// ── Dark-green sidebar palette — scoped to this component only ──────────────
const C = {
  bg:          '#0F1F17',
  bgHover:     '#1A2F24',
  activeBg:    '#FFFFFF',
  activeText:  '#0F1F17',
  text:        '#B9C8BE',
  textMuted:   '#7C8F82',
  border:      'rgba(255,255,255,0.07)',
  gold:        '#F5C842',
};

interface SidebarProps {
  mobileOpen:    boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const profile           = useProfile();
  const pathname          = usePathname();
  const role               = (user?.role ?? 'customer') as Role;
  const navItems           = NAV[role] ?? NAV.customer;

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  const accountHref =
    role === 'vendor' ? '/vendor/settings/account' :
    role === 'admin'  ? '/admin/dashboard'          : '/customer/account/profile';

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'User';
  const initial      = displayName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: C.bg }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: `1px solid ${C.border}` }}>
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo-light.png" alt="LinkMart Logo"
            width={110} height={26} className="h-6 w-auto" priority
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>
            Link<span style={{ color: C.gold }}>Mart</span>
          </span>
        </Link>
        <button onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg transition"
          style={{ color: C.text }}>
          <X size={16} />
        </button>
      </div>

      {/* User identity card */}
      <Link
        href={accountHref}
        onClick={onMobileClose}
        className="flex items-center gap-3 px-5 py-4 no-underline transition-colors"
        style={{ borderBottom: `1px solid ${C.border}` }}
        onMouseEnter={e => (e.currentTarget.style.background = C.bgHover)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: C.bgHover, border: `1px solid ${C.border}` }}>
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: C.gold, fontSize: 13, fontWeight: 800 }}>{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold truncate" style={{ color: '#fff' }}>
            {displayName}
          </p>
          <p className="text-[10px] truncate capitalize" style={{ color: C.textMuted }}>
            {role} account
          </p>
        </div>
        <ChevronRight size={13} style={{ color: C.textMuted, flexShrink: 0 }} />
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl no-underline text-sm font-semibold transition-all"
              style={{
                background: active ? C.activeBg : 'transparent',
                color:      active ? C.activeText : C.text,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bgHover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Browse store — soft promo card */}
      <div className="px-3 pb-3">
        <Link
          href="/store"
          onClick={onMobileClose}
          className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl no-underline text-sm font-bold transition"
          style={{ background: C.bgHover, color: C.gold, border: `1px solid ${C.border}` }}
        >
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-1" style={{ borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => { logout(); onMobileClose(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
          style={{ color: '#F87171' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 z-40">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-60 z-50 lg:hidden
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}