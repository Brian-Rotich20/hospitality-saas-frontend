'use client';

/**
 * Header — Dukaan Marketplace
 *
 * 60-30-10 palette:
 *   60% → #FFFFFF / #F5F7FA  (background, cards, breathing room)
 *   30% → #1C2B4A            (navy — logo, nav text, structure)
 *   10% → #E8612C            (burnt-orange accent — CTA, badges, hover)
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { useMobileMenu } from '../../lib/hooks/useMobileMenu';
import {
  Search, Menu, X, LogOut, User,
  Bell, MessageSquare, Bookmark, ChevronDown,
  Tag, Store,
} from 'lucide-react';

const CSS = `
  /* ── Reset ── */
  .hdr * { box-sizing: border-box; }

  /* ════════════════════════════════════
     TOP UTILITY BAR  (30% navy strip)
  ════════════════════════════════════ */
  .hdr-utility {
    background: #1C2B4A;
    padding: 0;
  }
  .hdr-utility-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    font-family: 'DM Sans', sans-serif;
  }
  .hdr-utility-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .hdr-utility-link {
    font-size: 11.5px;
    color: #8fa8c4;
    text-decoration: none;
    font-weight: 400;
    transition: color 0.15s;
    white-space: nowrap;
  }
  .hdr-utility-link:hover { color: #ffffff; }

  .hdr-utility-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* Icon action buttons */
  .hdr-icon-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: transparent;
    border: none;
    border-radius: 5px;
    color: #8fa8c4;
    font-size: 11.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .hdr-icon-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .hdr-badge {
    position: absolute;
    top: 1px;
    right: 4px;
    background: #E8612C;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .hdr-divider-v {
    width: 1px;
    height: 16px;
    background: rgba(255,255,255,0.1);
    margin: 0 2px;
  }

  /* ════════════════════════════════════
     MAIN HEADER BAR  (60% white)
  ════════════════════════════════════ */
  .hdr-main {
    background: #ffffff;
    border-bottom: 1px solid #e5e9f0;
    position: sticky;
    top: 0;
    z-index: 100;
    transition: box-shadow 0.3s;
  }
  .hdr-main.scrolled {
    box-shadow: 0 2px 16px rgba(28, 43, 74, 0.08);
  }
  .hdr-main-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    height: 60px;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Logo ── */
  .hdr-logo {
    display: flex;
    align-items: baseline;
    gap: 1px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .hdr-logo-word {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px;
    font-weight: 700;
    color: #1C2B4A;
    letter-spacing: -0.5px;
  }
  .hdr-logo-dot {
    width: 7px;
    height: 7px;
    background: #E8612C;
    border-radius: 50%;
    margin-bottom: 2px;
    flex-shrink: 0;
  }

  /* ── Search bar (prominent — 10% accent on focus) ── */
  .hdr-search {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1.5px solid #e5e9f0;
    border-radius: 8px;
    background: #F5F7FA;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    max-width: 600px;
  }
  .hdr-search:focus-within {
    border-color: #E8612C;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(232, 97, 44, 0.10);
  }
  .hdr-search-category {
    padding: 0 12px;
    height: 40px;
    border: none;
    border-right: 1.5px solid #e5e9f0;
    background: transparent;
    font-size: 12.5px;
    font-family: 'DM Sans', sans-serif;
    color: #5a7192;
    font-weight: 500;
    appearance: none;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    min-width: 100px;
  }
  .hdr-search-input {
    flex: 1;
    padding: 0 14px;
    height: 40px;
    border: none;
    background: transparent;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1C2B4A;
    outline: none;
  }
  .hdr-search-input::placeholder { color: #9baec8; }
  .hdr-search-btn {
    padding: 0 18px;
    height: 40px;
    background: #E8612C;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .hdr-search-btn:hover { background: #cf521f; }

  /* ── Sell button ── */
  .hdr-sell-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    background: #1C2B4A;
    color: #fff;
    border: none;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .hdr-sell-btn:hover { background: #E8612C; }

  /* ── User menu ── */
  .hdr-user-wrap { position: relative; flex-shrink: 0; }
  .hdr-user-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    background: transparent;
    border: 1.5px solid #e5e9f0;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, background 0.2s;
  }
  .hdr-user-btn:hover { border-color: #1C2B4A; background: #F5F7FA; }
  .hdr-avatar {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #e8edf4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1C2B4A;
    flex-shrink: 0;
  }
  .hdr-user-name {
    font-size: 13px;
    font-weight: 600;
    color: #1C2B4A;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-chevron { color: #9baec8; transition: transform 0.2s; }
  .hdr-chevron.open { transform: rotate(180deg); }

  .hdr-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 196px;
    background: #fff;
    border: 1px solid #e5e9f0;
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(28,43,74,0.12);
    overflow: hidden;
    z-index: 200;
    animation: dropFade 0.15s ease;
  }
  @keyframes dropFade {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hdr-drop-head {
    padding: 12px 14px 10px;
    border-bottom: 1px solid #f0f3f8;
  }
  .hdr-drop-role {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #E8612C;
    margin-bottom: 1px;
  }
  .hdr-drop-email {
    font-size: 11.5px;
    color: #9baec8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-drop-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #1C2B4A;
    text-decoration: none;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }
  .hdr-drop-item:hover { background: #F5F7FA; }
  .hdr-drop-divider { height: 1px; background: #f0f3f8; }
  .hdr-drop-item.danger { color: #c0392b; }
  .hdr-drop-item.danger:hover { background: #fdf4f4; }

  /* ── Auth buttons ── */
  .hdr-btn-ghost {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #1C2B4A;
    background: transparent;
    border: 1.5px solid #e5e9f0;
    border-radius: 7px;
    text-decoration: none;
    white-space: nowrap;
    transition: border-color 0.2s, background 0.2s;
    flex-shrink: 0;
  }
  .hdr-btn-ghost:hover { border-color: #1C2B4A; background: #F5F7FA; }
  .hdr-btn-solid {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: #E8612C;
    border: none;
    border-radius: 7px;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .hdr-btn-solid:hover { background: #cf521f; }

  /* ── Nav strip below main bar ── */
  .hdr-nav-strip {
    background: #ffffff;
    border-bottom: 1px solid #e5e9f0;
  }
  .hdr-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 2px;
    height: 40px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .hdr-nav-inner::-webkit-scrollbar { display: none; }
  .hdr-nav-link {
    padding: 5px 13px;
    font-size: 13px;
    font-weight: 500;
    color: #5a7192;
    text-decoration: none;
    border-radius: 5px;
    white-space: nowrap;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .hdr-nav-link:hover { color: #1C2B4A; background: #F5F7FA; }
  .hdr-nav-link.active { color: #E8612C; font-weight: 600; background: #fdf2ed; }

  /* ── Mobile menu button ── */
  .hdr-mob-btn {
    display: none;
    padding: 7px;
    background: transparent;
    border: 1.5px solid #e5e9f0;
    border-radius: 7px;
    cursor: pointer;
    color: #1C2B4A;
    flex-shrink: 0;
    transition: border-color 0.2s;
  }
  .hdr-mob-btn:hover { border-color: #1C2B4A; }

  /* ── Mobile drawer ── */
  .hdr-mob-drawer {
    border-top: 1px solid #e5e9f0;
    background: #fff;
    padding: 12px 0 16px;
    animation: slideDown 0.18s ease;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hdr-mob-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #1C2B4A;
    text-decoration: none;
    transition: background 0.15s;
  }
  .hdr-mob-link:hover, .hdr-mob-link.active { background: #F5F7FA; color: #E8612C; }
  .hdr-mob-divider { height: 1px; background: #f0f3f8; margin: 8px 0; }
  .hdr-mob-auth { padding: 8px 16px; display: flex; flex-direction: column; gap: 8px; }
  .hdr-mob-btn-ghost {
    display: block;
    text-align: center;
    padding: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #1C2B4A;
    border: 1.5px solid #e5e9f0;
    border-radius: 8px;
    text-decoration: none;
    transition: border-color 0.2s;
  }
  .hdr-mob-btn-ghost:hover { border-color: #1C2B4A; }
  .hdr-mob-btn-solid {
    display: block;
    text-align: center;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: #E8612C;
    border-radius: 8px;
    text-decoration: none;
  }
  .hdr-mob-danger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 500;
    color: #c0392b;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    transition: background 0.15s;
  }
  .hdr-mob-danger:hover { background: #fdf4f4; }

  @media (max-width: 768px) {
    .hdr-utility { display: none; }
    .hdr-search { display: none; }
    .hdr-sell-btn { display: none; }
    .hdr-user-wrap { display: none; }
    .hdr-btn-ghost, .hdr-btn-solid { display: none; }
    .hdr-nav-strip { display: none; }
    .hdr-mob-btn { display: flex; align-items: center; justify-content: center; }
  }
`;

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isOpen: isMenuOpen, toggle: toggleMenu, close: closeMenu } = useMobileMenu();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => pathname === href;

  const navLinks = [
    { href: '/listings', label: 'All Listings' },
    { href: '/listings?category=venue', label: 'Venues' },
    { href: '/listings?category=catering', label: 'Catering' },
    { href: '/listings?category=accommodation', label: 'Accommodation' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="hdr">

        {/* ── Utility Bar (30% navy) ── */}
        <div className="hdr-utility">
          <div className="hdr-utility-inner">
            <div className="hdr-utility-left">
              <span className="hdr-utility-link">Kenya's #1 Hospitality Marketplace</span>
              <a href="/about" className="hdr-utility-link">How it works</a>
              <a href="/auth/register-vendor" className="hdr-utility-link">Become a Vendor</a>
            </div>
            <div className="hdr-utility-right">
              {isAuthenticated ? (
                <>
                  <Link href="/saved" className="hdr-icon-btn">
                    <Bookmark size={13} /> Saved
                  </Link>
                  <div className="hdr-divider-v" />
                  <Link href="/messages" className="hdr-icon-btn" style={{ position: 'relative' }}>
                    <MessageSquare size={13} /> Messages
                    <span className="hdr-badge">3</span>
                  </Link>
                  <div className="hdr-divider-v" />
                  <Link href="/notifications" className="hdr-icon-btn" style={{ position: 'relative' }}>
                    <Bell size={13} /> Notifications
                    <span className="hdr-badge">5</span>
                  </Link>
                </>
              ) : (
                <>
                  <a href="/auth/login" className="hdr-utility-link">Sign in</a>
                  <div className="hdr-divider-v" />
                  <a href="/auth/register" className="hdr-utility-link">Create account</a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Bar (60% white) ── */}
        <header className={`hdr-main${scrolled ? ' scrolled' : ''}`}>
          <div className="hdr-main-inner">

            {/* Logo */}
            <Link href="/" className="hdr-logo">
              <span className="hdr-logo-word">dukaan</span>
              <div className="hdr-logo-dot" />
            </Link>

            {/* Search — 10% accent on focus */}
            <div className="hdr-search">
              <select
                className="hdr-search-category"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="venue">Venues</option>
                <option value="catering">Catering</option>
                <option value="accommodation">Accommodation</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                className="hdr-search-input"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`;
                }}
              />
              <button
                className="hdr-search-btn"
                onClick={() =>
                  (window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`)
                }
              >
                <Search size={16} />
              </button>
            </div>

            {/* Sell / List button */}
            <Link href="/listings/new" className="hdr-sell-btn">
              <Tag size={14} /> Sell / List
            </Link>

            {/* Auth / User */}
            {isAuthenticated ? (
              <div className="hdr-user-wrap" ref={userMenuRef}>
                <button
                  className="hdr-user-btn"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                >
                  <div className="hdr-avatar"><User size={14} /></div>
                  <span className="hdr-user-name">{user?.email?.split('@')[0]}</span>
                  <ChevronDown size={13} className={`hdr-chevron${isUserMenuOpen ? ' open' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="hdr-dropdown">
                    <div className="hdr-drop-head">
                      <div className="hdr-drop-role">{user?.role ?? 'Member'}</div>
                      <div className="hdr-drop-email">{user?.email}</div>
                    </div>
                    <Link href="/profile" className="hdr-drop-item" onClick={() => setIsUserMenuOpen(false)}>
                      <User size={13} /> My Account
                    </Link>
                    {user?.role === 'customer' && (
                      <Link href="/dashboard" className="hdr-drop-item" onClick={() => setIsUserMenuOpen(false)}>
                        <Store size={13} /> Dashboard
                      </Link>
                    )}
                    {user?.role === 'vendor' && (
                      <Link href="/dashboard" className="hdr-drop-item" onClick={() => setIsUserMenuOpen(false)}>
                        <Store size={13} /> Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link href="/admin/dashboard" className="hdr-drop-item" onClick={() => setIsUserMenuOpen(false)}>
                        <Store size={13} /> Admin Panel
                      </Link>
                    )}
                    <Link href="/saved" className="hdr-drop-item" onClick={() => setIsUserMenuOpen(false)}>
                      <Bookmark size={13} /> Saved Listings
                    </Link>
                    <div className="hdr-drop-divider" />
                    <button
                      className="hdr-drop-item danger"
                      onClick={() => { logout(); setIsUserMenuOpen(false); }}
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hdr-btn-ghost">Log in</Link>
                <Link href="/auth/register" className="hdr-btn-solid">Sign up</Link>
              </>
            )}

            {/* Mobile toggle */}
            <button className="hdr-mob-btn" onClick={toggleMenu}>
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Mobile Drawer */}
          {isMenuOpen && (
            <div className="hdr-mob-drawer">
              {/* Mobile search */}
              <div style={{ padding: '4px 16px 12px', display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, padding: '9px 12px', border: '1px solid #e5e9f0',
                    borderRadius: 7, fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                    background: '#F5F7FA', outline: 'none', color: '#1C2B4A',
                  }}
                />
                <button
                  onClick={() => (window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`)}
                  style={{
                    padding: '9px 14px', background: '#E8612C', border: 'none',
                    borderRadius: 7, color: '#fff', cursor: 'pointer',
                  }}
                >
                  <Search size={15} />
                </button>
              </div>

              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={`hdr-mob-link${isActive(l.href) ? ' active' : ''}`} onClick={closeMenu}>
                  {l.label}
                </Link>
              ))}

              <div className="hdr-mob-divider" />

              {isAuthenticated ? (
                <>
                  <Link href="/saved" className="hdr-mob-link" onClick={closeMenu}><Bookmark size={14} /> Saved</Link>
                  <Link href="/messages" className="hdr-mob-link" onClick={closeMenu}><MessageSquare size={14} /> Messages</Link>
                  <Link href="/notifications" className="hdr-mob-link" onClick={closeMenu}><Bell size={14} /> Notifications</Link>
                  <Link href="/profile" className="hdr-mob-link" onClick={closeMenu}><User size={14} /> My Account</Link>
                  <div className="hdr-mob-divider" />
                  <button className="hdr-mob-danger" onClick={() => { logout(); closeMenu(); }}>
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <div className="hdr-mob-auth">
                  <Link href="/auth/login" className="hdr-mob-btn-ghost" onClick={closeMenu}>Log in</Link>
                  <Link href="/auth/register" className="hdr-mob-btn-solid" onClick={closeMenu}>Sign up free</Link>
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Category Nav Strip ── */}
        <nav className="hdr-nav-strip">
          <div className="hdr-nav-inner">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`hdr-nav-link${isActive(l.href) ? ' active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

      </div>
    </>
  );
}