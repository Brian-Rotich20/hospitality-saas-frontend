'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
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
    { href: '/vendor/settings/profile', label: 'Settings',    Icon: Settings        },
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
    { href: '/customer/dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/customer/bookings',  label: 'My Bookings', Icon: Calendar        },
    { href: '/customer/saved',     label: 'Saved',       Icon: Heart           },
    { href: '/customer/profile',   label: 'Profile',     Icon: User            },
  ],
};

interface SidebarProps {
  mobileOpen:    boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname         = usePathname();
  const role             = (user?.role ?? 'customer') as Role;
  const navItems         = NAV[role] ?? NAV.customer;

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <Link
          href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart Logo"
            width={120} height={28} className="h-7 w-auto" priority />
        </Link>
        <button onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 transition"
          style={{ borderRadius: 'var(--radius-lg)', color: 'var(--color-text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onMobileClose}
              className={`nav-item${active ? ' nav-item-active' : ''}`}>
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} style={{ opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Browse store */}
      <div className="px-3 pb-2">
        <Link href="/store" onClick={onMobileClose} className="nav-item">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-1"
        style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={() => { logout(); onMobileClose(); }}
          className="nav-item-danger w-full">
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 z-40"
        style={{
          backgroundColor: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
        }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed left-0 top-0 h-screen w-56 z-50 lg:hidden
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
        }}>
        <SidebarContent />
      </aside>
    </>
  );
}