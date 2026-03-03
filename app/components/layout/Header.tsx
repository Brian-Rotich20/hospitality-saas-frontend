'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { useMobileMenu } from '../../lib/hooks/useMobileMenu';
import {
  Home, Search, Heart, Mail, CalendarCheck, LayoutGrid,
  Bell, Menu, X, LogOut, User, Store, Bookmark,
  MessageSquare, ChevronDown, MapPin, Clock, Calendar,
  Utensils, Building2, Camera, Music, Flower2, Bus, Sparkles,
  MoreHorizontal,
} from 'lucide-react';

/* ─── Category strip data ─────────────────────── */
const CATEGORIES = [
  { href: '/listings',                        Icon: LayoutGrid, label: 'All'           },
  { href: '/listings?category=venue',         Icon: Building2,  label: 'Venues'        },
  { href: '/listings?category=catering',      Icon: Utensils,   label: 'Catering'      },
  { href: '/listings?category=photography',   Icon: Camera,     label: 'Photography'   },
  { href: '/listings?category=music',         Icon: Music,      label: 'Music & DJ'    },
  { href: '/listings?category=decor',         Icon: Flower2,    label: 'Décor'         },
  { href: '/listings?category=transport',     Icon: Bus,        label: 'Transport'     },
  { href: '/listings?category=other',         Icon: Sparkles,   label: 'Other'         },
];

/* ─── Top nav links ───────────────────────────── */
const NAV_LINKS = [
  { href: '/',          Icon: Home,          label: 'Home'        },
  { href: '/listings',  Icon: Search,        label: 'Search'      },
  { href: '/saved',     Icon: Heart,         label: 'Favorites'   },
  { href: '/messages',  Icon: Mail,          label: 'Inbox',  badge: 3 },
  { href: '/bookings',  Icon: CalendarCheck, label: 'My Bookings' },
  { href: '/dashboard', Icon: LayoutGrid,    label: 'My Listings' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useMobileMenu();
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const [query, setQuery]        = useState('');
  const dropRef  = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router   = useRouter();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close dropdown on outside click */
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
      router.push(`/listings?search=${encodeURIComponent(query.trim())}`);
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="font-sans">

      {/* ══════════════════════════════════════════
          MAIN HEADER BAR
      ══════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 bg-white border-b border-slate-200 transition-shadow duration-300
          ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : ''}`}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-7 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-9 h-9 bg-[#1d9bf0] rounded-xl flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 2h6a7 7 0 010 14H3V2z" fill="white" fillOpacity="0.9"/>
                <circle cx="9" cy="9" r="3" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <span className="text-[19px] font-bold text-slate-800 tracking-tight">Inova</span>
          </Link>

          {/* ── Icon Nav — centered ── */}
          <nav className="hidden lg:flex items-center flex-1 justify-center gap-1">
            {NAV_LINKS.map(({ href, Icon, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.75 px-4 py-2 rounded-xl no-underline
                  transition-colors duration-150 group
                  ${isActive(href)
                    ? 'text-[#1d9bf0]'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive(href) ? 2.2 : 1.8}
                />
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">{label}</span>
                {/* active underline */}
                {isActive(href) && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-[#1d9bf0] rounded-full" />
                )}
                {/* badge */}
                {badge && isAuthenticated && (
                  <span className="absolute top-1 right-2 bg-[#1d9bf0] text-white text-[9px] font-bold
                    min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-[3px]">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right side actions ── */}
          <div className="ml-auto lg:ml-0 flex items-center gap-3 shrink-0">

            {/* Bell */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center
                  justify-center text-slate-400 hover:text-[#1d9bf0] hover:border-[#1d9bf0]
                  hover:bg-blue-50 transition-colors no-underline"
              >
                <Bell size={18} strokeWidth={1.8} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                  border-2 border-white" />
              </Link>
            )}

            {/* List Service CTA */}
            <Link
              href="/listings/new"
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 bg-[#1d9bf0] text-white
                text-[13.5px] font-semibold rounded-xl hover:bg-[#0b86d6] transition-all
                hover:-translate-y-px no-underline whitespace-nowrap"
            >
              List Service
              <span className="text-lg font-light opacity-80">+</span>
            </Link>

            {/* ── Authenticated: user pill ── */}
            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-slate-50 border border-slate-200
                    rounded-full hover:border-[#1d9bf0] hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="text-[13px] font-semibold text-slate-700 max-w-[72px] truncate">
                    {user?.email?.split('@')[0]}
                  </span>
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-[#1d9bf0] flex items-center justify-center
                    text-white text-[13px] font-bold shrink-0">
                    {initials}
                  </div>
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white border border-slate-200
                    rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-drop-in">
                    {/* Head */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1d9bf0] mb-0.5">
                        {user?.role ?? 'Member'}
                      </p>
                      <p className="text-[12px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    {/* Items */}
                    {[
                      { href: '/profile',          Icon: User,     label: 'My Account'       },
                      ...(user?.role === 'vendor'
                        ? [{ href: '/dashboard',   Icon: Store,    label: 'Vendor Dashboard' }]
                        : user?.role === 'admin'
                        ? [{ href: '/admin/dashboard', Icon: Store, label: 'Admin Panel'     }]
                        : [{ href: '/dashboard',   Icon: Store,    label: 'Dashboard'        }]),
                      { href: '/saved',             Icon: Bookmark, label: 'Saved Listings'   },
                    ].map(({ href, Icon: I, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium
                          text-slate-700 hover:bg-slate-50 no-underline transition-colors"
                      >
                        <I size={14} className="text-slate-400" /> {label}
                      </Link>
                    ))}
                    <div className="h-px bg-slate-100" />
                    <button
                      onClick={() => { logout(); setDropOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium
                        text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>

            ) : (
              /* ── Unauthenticated ── */
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-[13px] font-medium text-slate-700 border border-slate-200
                    rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors no-underline"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1d9bf0] rounded-xl
                    hover:bg-[#0b86d6] transition-colors no-underline"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleMenu}
              className="lg:hidden w-10 h-10 flex items-center justify-center border border-slate-200
                rounded-xl text-slate-600 hover:border-slate-400 transition-colors"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white pb-4 animate-slide-down">
            {NAV_LINKS.map(({ href, Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-5 py-3 text-[14px] font-medium no-underline
                  transition-colors
                  ${isActive(href)
                    ? 'text-[#1d9bf0] bg-blue-50'
                    : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            {isAuthenticated ? (
              <>
                <Link href="/saved"         onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 no-underline"><Heart size={15}/> Saved</Link>
                <Link href="/messages"      onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 no-underline"><MessageSquare size={15}/> Messages</Link>
                <Link href="/listings/new"  onClick={closeMenu} className="flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 no-underline"><Store size={15}/> List a Service</Link>
                <div className="h-px bg-slate-100 my-2" />
                <button onClick={() => { logout(); closeMenu(); }} className="w-full flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={15}/> Logout
                </button>
              </>
            ) : (
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Link href="/auth/login"    onClick={closeMenu} className="block text-center py-2.5 border border-slate-200 rounded-xl text-[13.5px] font-medium text-slate-700 no-underline hover:border-slate-400">Log in</Link>
                <Link href="/auth/register" onClick={closeMenu} className="block text-center py-2.5 bg-[#1d9bf0] rounded-xl text-[13.5px] font-semibold text-white no-underline hover:bg-[#0b86d6]">Sign up free</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          SEARCH BAR — centered hero strip
      ══════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-[1280px] mx-auto px-6 flex justify-center">
          <div className="flex items-center w-full max-w-[680px] bg-white border border-slate-200
            rounded-2xl shadow-sm overflow-hidden hover:border-slate-300 focus-within:border-[#1d9bf0]
            focus-within:shadow-[0_0_0_3px_rgba(29,155,240,0.1)] transition-all">

            {/* Location / keyword input */}
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 min-w-0">
              <MapPin size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Add your location or keywords"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-[13.5px] text-slate-700 placeholder-slate-400 bg-transparent
                  outline-none border-none min-w-0"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-7 bg-slate-200 shrink-0" />

            {/* Date picker placeholder */}
            <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-slate-500
              hover:text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0">
              <Calendar size={14} className="text-slate-400" />
              Any Date
            </button>

            {/* Divider */}
            <div className="w-px h-7 bg-slate-200 shrink-0" />

            {/* Time picker placeholder */}
            <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-slate-500
              hover:text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0">
              <Clock size={14} className="text-slate-400" />
              Any Time
            </button>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-5 py-2.5 m-1 bg-[#1d9bf0] text-white text-[13.5px]
                font-semibold rounded-xl hover:bg-[#0b86d6] transition-colors shrink-0 whitespace-nowrap"
            >
              <Search size={15} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CATEGORY ICON STRIP
      ══════════════════════════════════════════ */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center h-[60px]
          overflow-x-auto hide-scrollbar gap-1">
          {CATEGORIES.map(({ href, Icon, label }) => {
            const active = pathname === '/listings' && label === 'All'
              ? true
              : pathname.includes('category') && href.includes(pathname.split('category=')[1] ?? '__');
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-[5px] px-5 py-2 rounded-xl
                  shrink-0 no-underline transition-colors group
                  ${active
                    ? 'text-[#1d9bf0]'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[11.5px] font-medium whitespace-nowrap leading-none">{label}</span>
                {active && (
                  <span className="absolute -bottom-px left-3 right-3 h-[2.5px] bg-[#1d9bf0] rounded-t-full" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button className="flex flex-col items-center gap-[5px] px-5 py-2 rounded-xl shrink-0
            text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronDown size={20} strokeWidth={1.7} />
            <span className="text-[11.5px] font-medium whitespace-nowrap leading-none">More</span>
          </button>
        </div>
      </nav>

    </div>
  );
}