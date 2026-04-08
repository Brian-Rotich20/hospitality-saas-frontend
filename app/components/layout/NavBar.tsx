// NavBar.tsx — add ref to measure actual height, set CSS var
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import {
  Home, Search, Heart, CalendarCheck, Bell, Menu, X,
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
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null); // ✅ measure actual height

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ✅ Set --header-h CSS variable whenever header resizes
  // This is the single source of truth for all sticky children
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

  return (
    <header
      ref={headerRef}  // ✅ attach ref
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300
        ${scrolled ? 'shadow-md' : ''}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
          <span className="text-base sm:text-xl font-black text-[#2D3B45] tracking-tight">
            Link<span className="text-[#F5C842]">Mart</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center flex-1 justify-center gap-0.5">
          {NAV_LINKS.map(({ href, Icon, label }) => (
            <Link key={href} href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl
                no-underline transition-colors
                ${isActive(href)
                  ? 'text-[#2D3B45]'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
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

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          {isAuthenticated && (
            <Link href="/notifications"
              className="relative w-9 h-9 rounded-full border border-gray-200 hidden sm:flex
                items-center justify-center text-gray-400 hover:text-[#2D3B45]
                hover:border-[#2D3B45] transition-colors no-underline">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F5C842]
                rounded-full border border-white" />
            </Link>
          )}
          <Link href="/vendor/listings/new"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-all no-underline whitespace-nowrap">
            + List Service
          </Link>
          <UserMenu />
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="lg:hidden w-9 h-9 flex items-center justify-center border border-gray-200
              rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <SearchBar />
      {menuOpen && <MobileDrawer navLinks={NAV_LINKS} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}