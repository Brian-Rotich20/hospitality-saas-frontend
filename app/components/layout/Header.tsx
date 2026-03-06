'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { useMobileMenu } from '../../lib/hooks/useMobileMenu';
import {
  Home, Search, Heart, CalendarCheck, LayoutGrid,
  Bell, Menu, X, LogOut, User, Store, Bookmark,
  ChevronDown, MapPin, Calendar, Clock,
  Utensils, Building2, Camera, Music, Flower2, Bus,
  MoreHorizontal, BookOpen, Mail,
} from 'lucide-react';

const CATEGORIES = [
  { href: '/store',                              Icon: LayoutGrid,     label: 'All'           },
  { href: '/store?category=event_venue',         Icon: Building2,      label: 'Venues'        },
  { href: '/store?category=catering',            Icon: Utensils,       label: 'Catering'      },
  { href: '/store?category=photography',         Icon: Camera,         label: 'Photography'   },
  { href: '/store?category=music',               Icon: Music,          label: 'Music & DJ'    },
  { href: '/store?category=decor',               Icon: Flower2,        label: 'Décor'         },
  { href: '/store?category=transport',           Icon: Bus,            label: 'Transport'     },
  { href: '/store?category=entertainment',       Icon: MoreHorizontal, label: 'Entertainment' },
  { href: '/store?category=education',           Icon: BookOpen,       label: 'Education'     },
];

const NAV_LINKS = [
  { href: '/',          Icon: Home,          label: 'Home'        },
  { href: '/listings',     Icon: Search,        label: 'Browse'      },
  { href: '/saved',     Icon: Heart,         label: 'Saved'       },
  { href: '/messages',  Icon: Mail,          label: 'Inbox',  badge: 3 },
  { href: '/bookings',  Icon: CalendarCheck, label: 'Bookings'    },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useMobileMenu();
  const [dropOpen,  setDropOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [query,     setQuery]     = useState('');
  const dropRef  = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);

  const handleSearch = () => {
    if (query.trim())
      router.push(`/store?search=${encodeURIComponent(query.trim())}`);
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="font-sans">

      {/* ── Main header ── */}
      <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-8 h-8 bg-[#2D3B45] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-[#F5C842] font-black text-xs">LM</span>
            </div>
            <span className="text-base font-black text-[#2D3B45] tracking-tight hidden sm:block">
              link<span className="text-[#F5C842]">mall</span>
            </span>
          </Link>

          {/* Nav — desktop only, centered */}
          <nav className="hidden lg:flex items-center flex-1 justify-center gap-0.5">
            {NAV_LINKS.map(({ href, Icon, label, badge }) => (
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
                {badge && isAuthenticated && (
                  <span className="absolute top-1 right-2 bg-[#2D3B45] text-[#F5C842] text-[9px] font-black
                    min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">

            {/* Bell — desktop */}
            {isAuthenticated && (
              <Link href="/notifications"
                className="relative w-9 h-9 rounded-full border border-gray-200 hidden sm:flex items-center
                  justify-center text-gray-400 hover:text-[#2D3B45] hover:border-[#2D3B45] transition-colors no-underline">
                <Bell size={17} strokeWidth={1.8} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F5C842] rounded-full border border-white" />
              </Link>
            )}

            {/* List Service CTA — tablet+ */}
            <Link href="/vendor/listings/new"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D3B45] text-white
                text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-all no-underline whitespace-nowrap">
              + List Service
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-gray-50 border border-gray-200
                    rounded-full hover:border-[#2D3B45] hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-gray-700 max-w-[64px] truncate hidden sm:block">
                    {user?.email?.split('@')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#2D3B45] flex items-center justify-center
                    text-[#F5C842] text-xs font-black shrink-0">
                    {initials}
                  </div>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-gray-200
                    rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#F5C842] bg-[#2D3B45] px-2 py-0.5 rounded-md inline-block mb-1">
                        {user?.role ?? 'Member'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { href: '/profile',   Icon: User,    label: 'My Account'       },
                      { href: user?.role === 'vendor' ? '/vendor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
                        Icon: Store, label: user?.role === 'vendor' ? 'Vendor Dashboard' : 'Dashboard' },
                      { href: '/saved',     Icon: Bookmark, label: 'Saved Listings'  },
                    ].map(({ href, Icon: I, label }) => (
                      <Link key={href} href={href} onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
                          text-gray-700 hover:bg-gray-50 no-underline transition-colors">
                        <I size={13} className="text-gray-400" /> {label}
                      </Link>
                    ))}
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={() => { logout(); setDropOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
                        text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/auth/login"
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200
                    rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors no-underline">
                  Log in
                </Link>
                <Link href="/auth/register"
                  className="px-3 py-1.5 text-xs font-bold text-[#2D3B45] bg-[#F5C842] rounded-xl
                    hover:bg-yellow-400 transition-colors no-underline">
                  Sign up
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={toggleMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center border border-gray-200
                rounded-xl text-gray-600 hover:border-gray-400 transition-colors">
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white pb-3">
            {NAV_LINKS.map(({ href, Icon, label }) => (
              <Link key={href} href={href} onClick={closeMenu}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium no-underline transition-colors
                  ${isActive(href) ? 'text-[#2D3B45] bg-yellow-50 border-l-2 border-[#F5C842]' : 'text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2 mx-4" />
            <Link href="/vendor/listings/new" onClick={closeMenu}
              className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2D3B45] no-underline">
              <Store size={16} /> + List a Service
            </Link>
            {isAuthenticated ? (
              <>
                <div className="h-px bg-gray-100 my-2 mx-4" />
                <button onClick={() => { logout(); closeMenu(); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Link href="/auth/login" onClick={closeMenu}
                  className="block text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 no-underline hover:border-gray-400">
                  Log in
                </Link>
                <Link href="/auth/register" onClick={closeMenu}
                  className="block text-center py-2.5 bg-[#F5C842] rounded-xl text-sm font-bold text-[#2D3B45] no-underline hover:bg-yellow-400">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Search bar ── */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
          <div className="flex items-center w-full max-w-2xl bg-white border border-gray-200
            rounded-2xl shadow-sm overflow-hidden hover:border-gray-300 focus-within:border-[#2D3B45]
            focus-within:shadow-[0_0_0_3px_rgba(45,59,69,0.08)] transition-all">

            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by location or keyword…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none border-none min-w-0"
              />
            </div>

            <div className="w-px h-6 bg-gray-200 shrink-0" />

            {/* Date — hidden on small mobile */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-500
              hover:text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0">
              <Calendar size={13} className="text-gray-400" />
              Any Date
            </button>

            <div className="hidden sm:block w-px h-6 bg-gray-200 shrink-0" />

            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2.5 m-1 bg-[#2D3B45] text-white text-xs
                font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors shrink-0 whitespace-nowrap">
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Category strip ── */}
      <nav className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-0.5 min-w-max">
          {CATEGORIES.map(({ href, Icon, label }) => {
            const active = pathname === '/store' && label === 'All'
              ? !pathname.includes('category')
              : pathname.includes(href.split('?category=')[1] ?? '__none__');
            return (
              <Link key={href} href={href}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                  shrink-0 no-underline transition-colors
                  ${active ? 'text-[#2D3B45]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[11px] font-semibold whitespace-nowrap leading-none">{label}</span>
                {active && (
                  <span className="absolute -bottom-px left-3 right-3 h-0.5 bg-[#F5C842] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}