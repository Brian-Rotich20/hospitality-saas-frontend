'use client';

// Role sidebar for the signed-in areas.
// Desktop: a full sidebar (logo, account card, labelled sections) that collapses to an icon
// rail with the round chevron; the choice is remembered per browser (see AppShell).
// Mobile: a bottom dock with the main destinations plus "More", which opens the full drawer.

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Calendar, BarChart3, Users, LogOut, User, Settings, ShoppingBag, X, Heart,
  MessageSquare, CreditCard, LayoutList, Receipt, Flag, TrendingUp, Tags, UserRound, Store,
  ChevronLeft, ChevronRight, Menu,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';
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

export const ACCOUNT_HREF: Record<Role, string> = {
  vendor: '/vendor/settings/account', customer: '/customer/account/profile', admin: '/admin/settings',
};
/** A conversation fills the phone screen with its own composer, so the mobile dock steps aside. */
export const showsMobileDock = (pathname: string) => !/^\/messages\/[^/]+/.test(pathname);

const HOME_HREF: Record<Role, string> = { vendor: '/vendor/dashboard', admin: '/admin/dashboard', customer: '/store' };

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
  /** Desktop only: icon rail instead of the full sidebar. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href.endsWith('dashboard') ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function UnreadBadge({ n, dot }: { n: number; dot?: boolean }) {
  if (n <= 0) return null;
  if (dot) return <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-card" aria-hidden />;
  return (
    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-on-brand text-[10px] font-bold flex items-center justify-center tabular-nums" aria-hidden>
      {n > 9 ? '9+' : n}
    </span>
  );
}

function NavLink({ item, active, unread, onClick, rail }: { item: NavItem; active: boolean; unread: number; onClick: () => void; rail: boolean }) {
  const { href, label, Icon } = item;
  const name = unread > 0 ? `${label}, ${unread} unread` : label;
  return (
    <Link href={href} onClick={onClick} aria-current={active ? 'page' : undefined}
      aria-label={rail ? name : undefined} title={rail ? label : undefined}
      className={`relative flex items-center gap-3 rounded-xl text-[13px] no-underline transition-colors
        ${rail ? 'justify-center w-11 h-11 mx-auto' : 'px-3 h-10'}
        ${active
          ? 'bg-primary text-white font-semibold shadow-[0_4px_12px_rgba(0,131,30,0.25)]'
          : 'text-text-secondary font-medium hover:text-text-primary hover:bg-surface-muted'}`}>
      <Icon size={18} className="shrink-0" aria-hidden />
      {!rail && <span className="flex-1 truncate">{label}</span>}
      {!rail && unread > 0 && <span className="sr-only">, {unread} unread</span>}
      <UnreadBadge n={unread} dot={rail} />
    </Link>
  );
}

function AccountCard({ role, rail, onClick }: { role: Role; rail: boolean; onClick: () => void }) {
  const { user } = useAuth();
  const profile = useProfile();
  const name = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Account';
  const avatar = (
    <span className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-primary-subtle text-primary shrink-0">
      {profile?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[14px] font-bold">{name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
  if (rail) {
    return (
      <Link href={ACCOUNT_HREF[role]} onClick={onClick} aria-label={`Account: ${name}`} title={name}
        className="flex justify-center no-underline rounded-full mx-auto hover:ring-2 hover:ring-border">
        {avatar}
      </Link>
    );
  }
  return (
    <Link href={ACCOUNT_HREF[role]} onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-page no-underline hover:border-border-strong transition-colors">
      {avatar}
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-text-primary truncate">{name}</span>
        {user?.email && <span className="block text-[11.5px] text-text-muted truncate">{user.email}</span>}
      </span>
      <ChevronRight size={16} className="text-text-muted shrink-0" aria-hidden />
    </Link>
  );
}

/** Vendors see their real subscription state here; it links to billing. */
function VendorSubscriptionNote({ onClick, rail }: { onClick: () => void; rail: boolean }) {
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
  const tone = h.tone === 'bad' ? 'border-error-border bg-error-bg' : h.tone === 'warn' ? 'border-warning-border bg-warning-bg' : 'border-border bg-page';
  if (rail) {
    if (h.tone !== 'bad' && h.tone !== 'warn') return null;
    return (
      <Link href="/vendor/subscription" onClick={onClick} aria-label={h.title} title={h.title}
        className={`relative mx-auto w-11 h-11 rounded-xl border flex items-center justify-center no-underline ${tone}`}>
        <CreditCard size={18} className={h.tone === 'bad' ? 'text-error' : 'text-warning'} aria-hidden />
      </Link>
    );
  }
  return (
    <Link href="/vendor/subscription" onClick={onClick}
      className={`block rounded-xl border px-3.5 py-3 no-underline transition-colors hover:border-border-strong ${tone}`}>
      <p className={`text-[12px] font-semibold leading-snug m-0 ${h.tone === 'bad' ? 'text-error' : h.tone === 'warn' ? 'text-warning' : 'text-text-primary'}`}>
        {h.title}
      </p>
      {h.detail && <p className="text-[11px] text-text-muted leading-snug mt-0.5 mb-0">{h.detail}</p>}
    </Link>
  );
}

function SidebarBody({ role, rail, onNavigate, onClose, onToggle }: {
  role: Role; rail: boolean; onNavigate: () => void; onClose?: () => void; onToggle?: () => void;
}) {
  const { logout } = useAuth();
  const isActive = useActive();
  const { title, primary, general } = NAV[role];
  const unread = useUnreadCount(role !== 'admin');

  const section = (label: string, items: NavItem[]) => (
    <div>
      {rail
        ? <div className="mx-3 mb-2 border-t border-border" aria-hidden />
        : <p className="section-label px-3 mb-2">{label}</p>}
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} rail={rail}
            unread={item.messages ? unread : 0} onClick={onNavigate} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${rail ? 'px-2 py-4' : 'p-4'}`}>
      <div className={`flex items-center mb-5 ${rail ? 'flex-col gap-3' : 'justify-between px-1'}`}>
        <Link href={HOME_HREF[role]} onClick={onNavigate} className="flex items-center gap-2 no-underline shrink-0" aria-label="LinkMart home">
          <Image src="/images/mark.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full" priority />
          {!rail && <span className="text-[19px] font-bold tracking-[-0.02em] text-text-primary">LinkMart</span>}
        </Link>
        {onToggle && (
          <button type="button" onClick={onToggle} aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!rail}
            className="w-8 h-8 rounded-full border border-border bg-card text-text-secondary flex items-center justify-center hover:bg-surface-muted hover:text-text-primary transition-colors">
            {rail ? <ChevronRight size={16} aria-hidden /> : <ChevronLeft size={16} aria-hidden />}
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:bg-surface-muted transition">
            <X size={16} aria-hidden />
          </button>
        )}
      </div>

      <div className="mb-5"><AccountCard role={role} rail={rail} onClick={onNavigate} /></div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-5 -mx-1 px-1" aria-label="Main">
        {section(title, primary)}
        {section('Settings', general)}
      </nav>

      {/* Dock: billing state and sign out stay pinned to the bottom. */}
      <div className="pt-4 mt-4 border-t border-border space-y-2">
        {role === 'vendor' && <VendorSubscriptionNote onClick={onNavigate} rail={rail} />}
        <button type="button" onClick={() => { onNavigate(); void logout(); }}
          aria-label={rail ? 'Sign out' : undefined} title={rail ? 'Sign out' : undefined}
          className={`flex items-center gap-3 rounded-xl text-[13px] font-medium text-text-secondary hover:text-error hover:bg-error-bg transition-colors
            ${rail ? 'justify-center w-11 h-11 mx-auto' : 'px-3 h-10 w-full'}`}>
          <LogOut size={18} className="shrink-0" aria-hidden />
          {!rail && 'Sign out'}
        </button>
      </div>
    </div>
  );
}

/** Mobile bottom dock: up to four main destinations plus "More" for the full menu. */
function MobileDock({ role, onMore, moreOpen }: { role: Role; onMore: () => void; moreOpen: boolean }) {
  const isActive = useActive();
  const unread = useUnreadCount(role !== 'admin');
  const items = NAV[role].primary.slice(0, 4);
  return (
    <nav aria-label="Quick navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(3,2,7,0.06)]">
      <ul className="grid grid-cols-5 h-16 list-none m-0 p-0">
        {items.map((item) => {
          const active = isActive(item.href);
          const n = item.messages ? unread : 0;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? 'page' : undefined}
                aria-label={n > 0 ? `${item.label}, ${n} unread` : undefined}
                className={`h-full flex flex-col items-center justify-center gap-1 text-[11px] no-underline ${active ? 'text-primary font-semibold' : 'text-text-secondary font-medium'}`}>
                <span className={`relative w-12 h-7 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-primary text-white' : ''}`}>
                  <item.Icon size={18} aria-hidden />
                  {n > 0 && <span className="absolute top-0 right-2 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-card" aria-hidden />}
                </span>
                <span className="truncate max-w-full px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMore} aria-expanded={moreOpen} aria-haspopup="dialog"
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-text-secondary">
            <span className="w-12 h-7 rounded-full flex items-center justify-center"><Menu size={18} aria-hidden /></span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function Sidebar({ mobileOpen, onMobileClose, onMobileOpen, collapsed, onToggleCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const role: Role = user?.role === 'vendor' || user?.role === 'admin' ? user.role : 'customer';

  // Close the drawer with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const showDock = showsMobileDock(pathname);

  return (
    <>
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-card border-r border-border transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}>
        <SidebarBody role={role} rail={collapsed} onNavigate={() => undefined} onToggle={onToggleCollapsed} />
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} aria-hidden />}

      <aside aria-hidden={!mobileOpen} role="dialog" aria-label="Menu"
        className={`fixed left-0 top-0 h-[100dvh] w-[280px] max-w-[85vw] z-50 lg:hidden bg-card border-r border-border
          transform transition-transform duration-200 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full invisible'}`}>
        <SidebarBody role={role} rail={false} onNavigate={onMobileClose} onClose={onMobileClose} />
      </aside>

      {showDock && <MobileDock role={role} onMore={onMobileOpen} moreOpen={mobileOpen} />}
    </>
  );
}
