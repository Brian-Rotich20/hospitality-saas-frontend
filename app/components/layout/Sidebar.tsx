// components/layout/Sidebar.tsx
// ✅ Client Component — uses auth context for user info + logout
// Supports vendor, admin, customer roles
// Mobile: hidden off-canvas drawer toggled by VendorTopbar/Header
// Desktop: fixed left sidebar

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import Image from 'next/image'; 
import {
  LayoutDashboard, Package, Calendar, BarChart3,
  Users, LogOut, User, Settings, ShoppingBag,
  ChevronRight, X,
} from 'lucide-react';

// ── Nav config per role ───────────────────────────────────────────────────────
type Role = 'customer' | 'vendor' | 'admin';

interface NavItem {
  href:  string;
  label: string;
  Icon:  React.ElementType;
}

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: '/vendor/dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/vendor/listings',  label: 'My Listings',  Icon: Package         },
    { href: '/vendor/bookings',  label: 'Bookings',     Icon: Calendar        },
    { href: '/vendor/analytics', label: 'Analytics',    Icon: BarChart3       },
    { href: '/vendor/settings/profile',  label: 'Settings',     Icon: Settings        },
  ],
  admin: [
    { href: '/admin/dashboard',  label: 'Dashboard',    Icon: LayoutDashboard },
    { href: '/admin/vendors',    label: 'Vendors',       Icon: Users           },
    { href: '/admin/listings',   label: 'Listings',      Icon: Package         },
    { href: '/admin/bookings',   label: 'Bookings',      Icon: Calendar        },
    { href: '/admin/analytics',  label: 'Analytics',     Icon: BarChart3       },
    {href: '/admin/categories', label: 'Categories',    Icon: Settings        },
  ],
  customer: [
    { href: '/dashboard',        label: 'Dashboard',    Icon: LayoutDashboard },
    { href: '/bookings',         label: 'My Bookings',  Icon: Calendar        },
    { href: '/profile',          label: 'Profile',      Icon: User            },
  ],
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface SidebarProps {
  mobileOpen:    boolean;
  onMobileClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname         = usePathname();
  const role             = (user?.role ?? 'customer') as Role;
  const navItems         = NAV[role] ?? NAV.customer;

  // Active check — exact match for dashboard, prefix for others
  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname.startsWith(href);

  // ── Sidebar inner content (shared between mobile + desktop) ──────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        
        <Link
          href={
            role === "vendor"
              ? "/vendor/dashboard"
              : role === "admin"
              ? "/admin/dashboard"
              : "/store"
          }
          className="flex items-center no-underline shrink-0"
        >
          <Image
            src="/images/logo.png"
            alt="LinkMart Logo"
            width={120}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <X size={16} />
        </button>

      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2D3B45] flex items-center justify-center shrink-0">
            <span className="text-[#F5C842] text-xs font-black">
              {(user?.fullName ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user?.fullName ?? user?.email?.split('@')[0] ?? 'User'}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors
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

      {/* Browse store link */}
      <div className="px-3 pb-2">
        <Link href="/store" onClick={onMobileClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400
            hover:bg-gray-100 hover:text-gray-700 no-underline transition-colors">
          <ShoppingBag size={15} className="shrink-0" />
          Browse Store
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-1 border-t border-gray-100">
        <button onClick={() => { logout(); onMobileClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold
            text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar — fixed, always visible ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-57 bg-white border-r border-gray-100 z-40">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`fixed left-0 top-0 h-screen w-57 bg-white border-r border-gray-100 z-50 lg:hidden
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}