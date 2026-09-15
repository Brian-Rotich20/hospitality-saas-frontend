'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import Image from 'next/image';
import {
  Heart, CalendarCheck, Bell, Menu, X,
  LayoutList, MessageSquare, LayoutDashboard,
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { MobileDrawer } from './MobileDrawer';

const CUSTOMER_NAV = [
  { href: '/customer/saved',    Icon: Heart,          label: 'Saved'    },
  { href: '/customer/bookings', Icon: CalendarCheck,  label: 'Bookings' },
];

const VENDOR_NAV = [
  { href: '/vendor/dashboard', Icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/vendor/listings',  Icon: LayoutList,       label: 'My Listings' },
  { href: '/vendor/bookings',  Icon: CalendarCheck,    label: 'Bookings'    },
];

export function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height ?? 0;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const role     = isAuthenticated ? (user?.role ?? 'customer') : null;
  const navLinks = role === 'vendor' ? VENDOR_NAV : role === 'customer' ? CUSTOMER_NAV : [];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-card border-b border-border transition-shadow duration-300
        ${scrolled ? 'shadow-md' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">

        <Link href="/" className="flex items-center shrink-0 no-underline">
          <Image src="/images/logo.png" alt="LinkMart" width={120} height={28}
            className="h-7 w-auto" priority />
        </Link>

        <div className="flex-1" />

        {isAuthenticated ? (
          <div className="flex items-center gap-1">

            {navLinks.length > 0 && (
              <nav className="hidden lg:flex items-center gap-0.5 mr-2">
                {navLinks.map(({ href, Icon, label }) => (
                  <Link key={href} href={href}
                    className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl
                      no-underline transition-colors
                      ${isActive(href)
                        ? 'text-brand'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-muted'}`}>
                    <Icon size={19} strokeWidth={isActive(href) ? 2.2 : 1.8} />
                    <span className="text-[11px] font-semibold leading-none whitespace-nowrap">
                      {label}
                    </span>
                    {isActive(href) && (
                      <span className="absolute -bottom-px left-1/2 -translate-x-1/2
                        w-5 h-0.5 bg-accent rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            )}

            <Link href="/messages" aria-label="Messages"
              className="relative w-9 h-9 rounded-full border border-border hidden sm:flex
                items-center justify-center text-text-muted hover:text-brand
                hover:border-brand transition-colors no-underline">
              <MessageSquare size={17} strokeWidth={1.8} />
            </Link>

            <Link href="/notifications" aria-label="Notifications"
              className="relative w-9 h-9 rounded-full border border-border hidden sm:flex
                items-center justify-center text-text-muted hover:text-brand
                hover:border-brand transition-colors no-underline ml-1">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent
                rounded-full border border-card" />
            </Link>

            <div className="ml-2"><UserMenu /></div>
          </div>

        ) : (
          <div className="flex items-center gap-2">
            <Link href="/vendor/listings/new"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white
                text-xs font-bold rounded-xl hover:bg-brand-hover transition-all no-underline whitespace-nowrap">
              + List Service
            </Link>
            <Link href="/auth/login"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-brand text-brand
                text-xs font-bold rounded-xl hover:bg-surface-muted transition-all no-underline whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}

        <button onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden w-9 h-9 flex items-center justify-center border border-border
            rounded-xl text-text-secondary hover:border-brand transition-colors ml-2">
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <SearchBar />
      {menuOpen && (
        <MobileDrawer navLinks={navLinks} isAuthenticated={isAuthenticated}
          onClose={() => setMenuOpen(false)} />
      )}
    </header>
  );
}