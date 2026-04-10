// NavBar.tsx
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
import { SearchBar } from './SearchBar'; // for consistent search experience across desktop/mobile
import { UserMenu } from './UserMenu';  // for user avatar and auth actions
import { MobileDrawer } from './MobileDrawer'; // for mobile nav links and auth actions

const CUSTOMER_NAV = [
  { href: '/saved',    Icon: Heart,          label: 'Saved'    },
  { href: '/bookings', Icon: CalendarCheck,  label: 'Bookings' },
];

const VENDOR_NAV = [
  { href: '/vendor/dashboard', Icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/vendor/listings',  Icon: LayoutList,       label: 'My Listings' },
  { href: '/bookings',         Icon: CalendarCheck,    label: 'Bookings'    },
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
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300
        ${scrolled ? 'shadow-md' : ''}`}
    >
      {/* ── single row: Logo · [spacer] · nav+actions ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">

        {/* Logo — always far left */}
        <Link href="/" className="flex items-center shrink-0 no-underline">
          <Image
            src="/images/logo.png"
            alt="LinkMart"
            width={120}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Spacer pushes everything after it to the right */}
        <div className="flex-1" />

        {/* ── Authenticated: centre nav links + icon actions + UserMenu ── */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">

            {/* Role-based nav links */}
            {navLinks.length > 0 && (
              <nav className="hidden lg:flex items-center gap-0.5 mr-2">
                {navLinks.map(({ href, Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl
                      no-underline transition-colors
                      ${isActive(href)
                        ? 'text-[#2D3B45]'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon size={19} strokeWidth={isActive(href) ? 2.2 : 1.8} />
                    <span className="text-[11px] font-semibold leading-none whitespace-nowrap">
                      {label}
                    </span>
                    {isActive(href) && (
                      <span className="absolute -bottom-px left-1/2 -translate-x-1/2
                        w-5 h-0.5 bg-[#F5C842] rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            )}

            {/* Messages */}
            <Link
              href="/messages"
              className="relative w-9 h-9 rounded-full border border-gray-200 hidden sm:flex
                items-center justify-center text-gray-400 hover:text-[#2D3B45]
                hover:border-[#2D3B45] transition-colors no-underline"
              aria-label="Messages"
            >
              <MessageSquare size={17} strokeWidth={1.8} />
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative w-9 h-9 rounded-full border border-gray-200 hidden sm:flex
                items-center justify-center text-gray-400 hover:text-[#2D3B45]
                hover:border-[#2D3B45] transition-colors no-underline ml-1"
              aria-label="Notifications"
            >
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F5C842]
                rounded-full border border-white" />
            </Link>

            <div className="ml-2">
              <UserMenu />
            </div>
          </div>

        ) : (
          /* ── Unauthenticated: List Service + Sign In — far right ────── */
          <div className="flex items-center gap-2">
            <Link
              href="/vendor/listings/new"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D3B45] text-white
                text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-all no-underline whitespace-nowrap"
            >
              + List Service
            </Link>
            <Link
              href="/auth/signin"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2D3B45] text-[#2D3B45]
                text-xs font-bold rounded-xl hover:bg-gray-50 transition-all no-underline whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Mobile hamburger — always far right */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden w-9 h-9 flex items-center justify-center border border-gray-200
            rounded-xl text-gray-600 hover:border-gray-400 transition-colors ml-2"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <SearchBar />
      {menuOpen && (
        <MobileDrawer
          navLinks={navLinks}
          isAuthenticated={isAuthenticated}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}