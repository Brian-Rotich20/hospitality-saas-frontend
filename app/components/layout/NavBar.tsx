'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import {
  Home, Search, Heart, CalendarCheck, Bell,
  Menu, X, LogOut, User, Store, Bookmark,
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { MobileDrawer } from './MobileDrawer';

const NAV_LINKS = [
  { href: '/',         Icon: Home,          label: 'Home'     },
  { href: '/store',    Icon: Search,        label: 'Browse'   },
  { href: '/saved',    Icon: Heart,         label: 'Saved'    },
  { href: '/bookings', Icon: CalendarCheck, label: 'Bookings' },
];

export function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
          <div className="w-8 h-8 bg-[#2D3B45] rounded-xl flex items-center justify-center">
            <span className="text-[#F5C842] font-black text-xs">LM</span>
          </div>
          <span className="text-base font-black text-[#2D3B45] tracking-tight hidden sm:block">
            link<span className="text-[#F5C842]">mall</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center flex-1 justify-center gap-0.5">
          {NAV_LINKS.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl no-underline transition-colors
                ${isActive(href)
                  ? 'text-[#2D3B45]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon size={19} strokeWidth={isActive(href) ? 2.2 : 1.8} />
              <span className="text-[11px] font-semibold leading-none whitespace-nowrap">{label}</span>
              {isActive(href) && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#F5C842] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">

          {/* Bell */}
          {isAuthenticated && (
            <Link href="/notifications"
              className="relative w-9 h-9 rounded-full border border-gray-200 hidden sm:flex items-center
                justify-center text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition-colors no-underline">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F5C842] rounded-full border border-white" />
            </Link>
          )}

          {/* List Service CTA */}
          <Link href="/vendor/listings/new"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-all no-underline whitespace-nowrap">
            + List Service
          </Link>

          <UserMenu />

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            className="lg:hidden w-9 h-9 flex items-center justify-center border border-gray-200
              rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <SearchBar />

      {/* ── Mobile drawer ── */}
      {menuOpen && <MobileDrawer navLinks={NAV_LINKS} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}