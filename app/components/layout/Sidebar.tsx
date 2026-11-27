'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Calendar, BarChart3, Users, LogOut, User, Settings, ShoppingBag, X, Heart,
  MessageSquare, CreditCard, LayoutList, Receipt, Flag, TrendingUp, Tags, UserRound, Store,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useUnreadCount } from '../../lib/messaging/unread';
import { subscriptionService } from '../../lib/api/endpoints';
import type { SubscriptionOverview } from '../../lib/types/subscription';
import { subscriptionHeadline } from '../../lib/subscriptions/subscription-ui';

type Role = 'customer' | 'vendor' | 'admin';
interface NavItem { href: string; label: string; Icon: React.ElementType; messages?: boolean }

const NAV: Record<Role, { title: string; primary: NavItem[]; general: NavItem[] }> = {
  vendor: {
    title: 'Business',
    primary: [
      { href: '/vendor/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { href: '/vendor/listings',  label: 'Listings',  Icon: LayoutList },
      { href: '/vendor/bookings',  label: 'Bookings',  Icon: Calendar },
      { href: '/messages',         label: 'Messages',  Icon: MessageSquare, messages: true },
      { href: '/vendor/analytics', label: 'Analytics', Icon: BarChart3 },
    ],
    general: [
      { href: '/vendor/subscription',     label: 'Subscription', Icon: CreditCard },
      { href: '/vendor/settings/profile', label: 'Business profile', Icon: Store },
      { href: '/vendor/settings/account', label: 'Account', Icon: User },
      { href: '/store',                   label: 'Browse store', Icon: ShoppingBag },
    ],
  },
  admin: {
    title: 'Platform',
    primary: [
      { href: '/admin/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
      { href: '/admin/vendors',       label: 'Vendors',       Icon: Users },
      { href: '/admin/customers',     label: 'Customers',     Icon: UserRound },
      { href: '/admin/bookings',      label: 'Bookings',      Icon: Calendar },
      { href: '/admin/subscriptions', label: 'Subscriptions', Icon: CreditCard },
      { href: '/admin/payments',      label: 'Payments',      Icon: Receipt },
      { href: '/admin/revenue',       label: 'Revenue',       Icon: TrendingUp },
      { href: '/admin/messages',      label: 'Message reports', Icon: Flag },
      { href: '/admin/categories',    label: 'Categories',    Icon: Tags },
    ],
    general: [
      { href: '/admin/settings', label: 'Profile', Icon: Settings },
      { href: '/store',          label: 'Browse store', Icon: ShoppingBag },
    ],
  },
  customer: {
    title: 'Account',
    primary: [
      { href: '/customer/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { href: '/customer/bookings',  label: 'Bookings',  Icon: Calendar },
      { href: '/messages',           label: 'Messages',  Icon: MessageSquare, messages: true },
      { href: '/customer/saved',     label: 'Saved',     Icon: Heart },
    ],
    general: [
      { href: '/customer/account/profile', label: 'Profile', Icon: User },
      { href: '/store',                    label: 'Browse store', Icon: ShoppingBag },
    ],
  },
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavLink({ item, active, unread, onClick }: { item: NavItem; active: boolean; unread: number; onClick: () => void }) {
  const { href, label, Icon } = item;
  return (
    <Link href={href} onClick={onClick} aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-bold no-underline transition-colors
        ${active ? 'bg-surface-muted text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'}`}>
      <Icon size={15} className="shrink-0" aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      {unread > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-black flex items-center justify-center tabular-nums"
          aria-label={`${unread} unread`}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

/** Vendors see their real subscription state here; it links to billing. */
function VendorSubscriptionNote({ onClick }: { onClick: () => void }) {
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    subscriptionService.overview()
      .then((res) => { if (!cancelled) setOverview(res.data); })
      .catch(() => { /* the billing page reports errors; the note is optional */ });
    return () => { cancelled = true; };
  }, [pathname]);
  if (!overview) return null;
  const h = subscriptionHeadline(overview);
  return (
    <Link href="/vendor/subscription" onClick={onClick}
      className={`mt-4 block rounded-xl border px-3.5 py-3 no-underline transition-colors hover:border-text-muted
        ${h.tone === 'bad' ? 'border-red-200 bg-red-50' : h.tone === 'warn' ? 'border-amber-200 bg-amber-50' : 'border-border bg-page'}`}>
      <p className={`text-[12px] font-bold leading-snug m-0 ${h.tone === 'bad' ? 'text-red-800' : h.tone === 'warn' ? 'text-amber-900' : 'text-text-primary'}`}>
        {h.title}
      </p>
      {h.detail && <p className="text-[11px] text-text-muted leading-snug mt-0.5 mb-0">{h.detail}</p>}
    </Link>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = (user?.role ?? 'customer') as Role;
  const { title, primary, general } = NAV[role] ?? NAV.customer;
  const unread = useUnreadCount(role !== 'admin' && !!user);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const isActive = (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const content = (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between px-1 mb-6">
        <Link href={role === 'vendor' ? '/vendor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/store'}
          className="flex items-center no-underline shrink-0">
          <Image src="/images/logo.png" alt="LinkMart" width={110} height={26} className="h-6 w-auto" priority />
        </Link>
        <button onClick={onMobileClose} aria-label="Close menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:bg-surface-muted transition">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6" aria-label="Main">
        <div>
          <p className="section-label px-3 mb-2">{title}</p>
          <div className="space-y-0.5">
            {primary.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)}
                unread={item.messages ? unread : 0} onClick={onMobileClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="section-label px-3 mb-2">Settings</p>
          <div className="space-y-0.5">
            {general.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} unread={0} onClick={onMobileClose} />
            ))}
            <button onClick={() => { onMobileClose(); void logout(); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-bold text-text-muted hover:text-error hover:bg-error-bg transition-colors w-full">
              <LogOut size={15} className="shrink-0" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {role === 'vendor' && <VendorSubscriptionNote onClick={onMobileClose} />}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-40 bg-card border-r border-border">
        {content}
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} aria-hidden />}

      <aside aria-hidden={!mobileOpen}
        className={`fixed left-0 top-0 h-screen w-[260px] max-w-[85vw] z-50 lg:hidden bg-card border-r border-border
          transform transition-transform duration-200 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full invisible'}`}>
        {content}
      </aside>
    </>
  );
}
