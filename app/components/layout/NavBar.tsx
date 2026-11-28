'use client';

// Public header: green bar with the logo, search, round icon shortcuts, the account menu and
// one orange call to action whose destination depends on who is signed in.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, CalendarCheck, Menu, X, MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useUnreadCount } from '../../lib/messaging/unread';
import { UserMenu } from './UserMenu';
import { MobileDrawer } from './MobileDrawer';

interface Shortcut { href: string; Icon: React.ElementType; label: string }

const CUSTOMER_NAV: Shortcut[] = [
  { href: '/customer/saved',    Icon: Heart,         label: 'Saved' },
  { href: '/customer/bookings', Icon: CalendarCheck, label: 'Bookings' },
];
const VENDOR_NAV: Shortcut[] = [
  { href: '/vendor/bookings',  Icon: CalendarCheck,   label: 'Bookings' },
];

function SearchForm({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  // Show the current search term (read on mount so static pages need no Suspense boundary).
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get('search') ?? ''); }, [pathname]);
  return (
    <form role="search" className={`relative ${className}`}
      onSubmit={(e) => { e.preventDefault(); const v = q.trim(); router.push(v ? `/store?search=${encodeURIComponent(v)}` : '/store'); }}>
      <label htmlFor="site-search" className="sr-only">Search listings</label>
      <input id="site-search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search venues, caterers, places…"
        className="w-full h-11 rounded-lg bg-white pl-4 pr-12 text-[15px] text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-white/60" />
      <button type="submit" aria-label="Search"
        className="absolute right-1 top-1 h-9 w-10 rounded-md flex items-center justify-center text-text-secondary hover:text-primary">
        <Search size={19} aria-hidden />
      </button>
    </form>
  );
}

export function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Pages with sticky side panels read the header height.
  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const role = isAuthenticated ? (user?.role ?? 'customer') : null;
  const shortcuts = role === 'vendor' ? VENDOR_NAV : role === 'customer' ? CUSTOMER_NAV : [];
  const unread = useUnreadCount(role === 'vendor' || role === 'customer');
  const cta = role === 'vendor' ? { href: '/vendor/listings/new', label: 'Add listing' }
    : role === 'customer' ? { href: '/vendor/onboarding?intent=vendor', label: 'List your business' }
    : role ? null : { href: '/auth/register-vendor', label: 'List your business' };
  const loginHref = pathname.startsWith('/auth') ? '/auth/login' : `/auth/login?redirect=${encodeURIComponent(pathname)}`;
  const isActive = (href: string) => pathname.startsWith(href);

  const circle = 'relative w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center no-underline transition-transform hover:scale-105';

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-primary text-white shadow-[0_2px_8px_rgba(3,2,7,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-[72px] flex items-center gap-3 lg:gap-6">
        <button onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
          className="lg:hidden -ml-1 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/store" className="flex items-center gap-2 shrink-0 no-underline" aria-label="LinkMart home">
          <Image src="/images/mark.png" alt="" width={36} height={36} className="w-9 h-9 rounded-full" priority />
          <span className="text-[22px] font-bold tracking-[-0.02em] text-white">LinkMart</span>
        </Link>

        <SearchForm className="hidden md:block flex-1 max-w-[560px]" />
        <div className="flex-1 md:hidden" />

        <nav aria-label="Shortcuts" className="flex items-center gap-2.5 ml-auto">
          {cta && (
            <Link href={cta.href}
              className="hidden md:flex mr-1 items-center h-11 px-6 rounded-lg bg-brand text-on-brand text-[15px] font-semibold no-underline hover:bg-brand-hover transition-colors whitespace-nowrap">
              {cta.label}
            </Link>
          )}
          {shortcuts.map(({ href, Icon, label }) => (
            <Link key={href} href={href} aria-label={label} title={label} aria-current={isActive(href) ? 'page' : undefined}
              className={`${circle} hidden sm:flex ${isActive(href) ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-primary' : ''}`}>
              <Icon size={20} strokeWidth={2} aria-hidden />
            </Link>
          ))}
          {(role === 'vendor' || role === 'customer') && (
            <Link href="/messages" aria-label={unread > 0 ? `Messages, ${unread} unread` : 'Messages'} title="Messages" className={`${circle} flex`}>
              <MessageSquare size={20} strokeWidth={2} aria-hidden />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-on-brand text-[10px] font-bold flex items-center justify-center ring-2 ring-primary">{unread > 9 ? '9+' : unread}</span>}
            </Link>
          )}
          {isAuthenticated ? <UserMenu /> : (
            <Link href={loginHref} className="h-11 px-3 flex items-center text-[15px] font-semibold text-white no-underline hover:underline underline-offset-4">Sign in</Link>
          )}
        </nav>
      </div>

      <div className="md:hidden px-4 pb-3">
        <SearchForm />
      </div>

      {menuOpen && (
        <MobileDrawer navLinks={shortcuts} isAuthenticated={isAuthenticated} onClose={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
