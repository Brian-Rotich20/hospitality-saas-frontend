'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ArrowRight, Store, Info, Lightbulb, LayoutGrid } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',         href: '/store',            icon: Store       },
  { label: 'How it Works', href: '#how-it-works',     icon: Lightbulb   },
  { label: 'About',        href: '/about',            icon: Info        },
  { label: 'For Vendors',  href: '/vendor/dashboard', icon: LayoutGrid  },
];

const CATEGORIES = [
  { icon: '🏛️', label: 'Event Venues',  value: 'event_venue',   count: 48 },
  { icon: '🍽️', label: 'Catering',      value: 'catering',      count: 32 },
  { icon: '🏨', label: 'Stays',         value: 'accommodation', count: 21 },
  { icon: '📸', label: 'Photography',   value: 'photography',   count: 17 },
  { icon: '🎵', label: 'Entertainment', value: 'entertainment', count: 14 },
];

export default function Hero() {
  const router     = useRouter();
  const pathname   = usePathname();
  const [query,      setQuery]      = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&display=swap');

        /* ── NAV ── */
        .lm-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 60px;
          background: rgba(15,26,20,0.94);
          backdrop-filter: blur(16px) saturate(160%);
          border-bottom: 1px solid rgba(212,237,71,0.07);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .lm-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
        }
        .lm-logo-mark {
          width: 32px; height: 32px; border-radius: 9px;
          background: #D4ED47;
          display: flex; align-items: center; justify-content: center;
        }
        .lm-logo-text {
          font-size: 15px; font-weight: 800; color: #fff;
          letter-spacing: -0.03em;
        }
        .lm-logo-text em { color: #D4ED47; font-style: normal; }

        .lm-nav-links { display: flex; align-items: center; gap: 2px; }
        .lm-nav-link {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 9px;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.48);
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .lm-nav-link:hover  { color: #fff; background: rgba(255,255,255,0.06); }
        .lm-nav-link.active { color: #D4ED47; }
        .lm-nav-link svg    { flex-shrink: 0; }

        .lm-nav-cta {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 20px; border-radius: 100px;
          background: #D4ED47; color: #0F1A14;
          font-size: 13px; font-weight: 800;
          text-decoration: none; letter-spacing: -0.01em;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .lm-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(212,237,71,0.35); }

        .lm-burger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 6px;
        }
        .lm-burger span {
          display: block; width: 22px; height: 2px;
          background: rgba(255,255,255,0.6); border-radius: 2px;
        }

        .lm-mobile-menu {
          display: none; flex-direction: column;
          background: #0A1410;
          border-bottom: 1px solid rgba(212,237,71,0.08);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .lm-mobile-menu.open { display: flex; }
        .lm-mobile-link {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 24px; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.55); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: color 0.15s, background 0.15s;
        }
        .lm-mobile-link:hover { color: #D4ED47; background: rgba(212,237,71,0.04); }

        /* ── HERO ── */
        .hero-section {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #0F1A14;
          min-height: 92vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px 64px;
          position: relative; overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 500px;
          background: radial-gradient(ellipse at 50% 0%, rgba(212,237,71,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-section::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none; opacity: 0.6;
        }

        .hero-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 680px; width: 100%;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; margin-bottom: 28px;
          border: 1px solid rgba(212,237,71,0.18);
          background: rgba(212,237,71,0.06);
          border-radius: 100px;
          font-size: 11px; font-weight: 700; color: #D4ED47;
          letter-spacing: 0.08em; text-transform: uppercase;
          opacity: 0; animation: up 0.5s 0.05s ease-out forwards;
        }
        .badge-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: #D4ED47;
          animation: pulse 2.2s ease-in-out infinite;
        }

        .hero-h1 {
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 800; line-height: 1.05;
          letter-spacing: -0.035em; color: #fff;
          margin-bottom: 18px;
          opacity: 0; animation: up 0.55s 0.15s ease-out forwards;
        }
        .hero-h1 .accent {
          color: #D4ED47; font-style: italic; font-weight: 400;
        }

        .hero-sub {
          font-size: 16px; line-height: 1.65;
          color: rgba(255,255,255,0.42);
          max-width: 420px; margin-bottom: 40px;
          opacity: 0; animation: up 0.55s 0.25s ease-out forwards;
        }

        .search-wrap {
          width: 100%; max-width: 520px; margin-bottom: 28px;
          opacity: 0; animation: up 0.55s 0.35s ease-out forwards;
        }
        .search-form {
          display: flex; align-items: center;
          background: #fff; border-radius: 14px;
          padding: 5px 5px 5px 18px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.35); gap: 10px;
        }
        .search-form svg { color: #9CA3AF; flex-shrink: 0; }
        .search-input {
          flex: 1; border: none; outline: none;
          font-size: 14px; font-weight: 500; font-family: inherit;
          color: #111827; background: transparent; padding: 9px 0;
        }
        .search-input::placeholder { color: #9CA3AF; font-weight: 400; }
        .search-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border: none; border-radius: 10px;
          background: #0F1A14; color: #fff;
          font-size: 13px; font-weight: 800; font-family: inherit;
          cursor: pointer; white-space: nowrap; transition: background 0.15s;
        }
        .search-btn:hover { background: #1e3320; }

        .cats {
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; justify-content: center;
          opacity: 0; animation: up 0.5s 0.45s ease-out forwards;
        }
        .cat-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          text-decoration: none; cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
        }
        .cat-pill:hover {
          border-color: rgba(212,237,71,0.35);
          background: rgba(212,237,71,0.06);
        }
        .cat-pill-icon  { font-size: 14px; line-height: 1; }
        .cat-pill-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .cat-pill:hover .cat-pill-label { color: #D4ED47; }
        .cat-pill-count { font-size: 11px; color: rgba(255,255,255,0.25); }

        .scroll-hint {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          opacity: 0; animation: up 0.5s 0.7s ease-out forwards;
          z-index: 1; cursor: pointer;
        }
        .scroll-dot {
          width: 20px; height: 32px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.15);
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 5px;
        }
        .scroll-dot-inner {
          width: 3px; height: 7px; border-radius: 2px;
          background: rgba(255,255,255,0.35);
          animation: scroll-down 1.8s ease-in-out infinite;
        }
        .scroll-label { font-size: 10px; color: rgba(255,255,255,0.2); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

        @keyframes up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes scroll-down {
          0%   { opacity: 1; transform: translateY(0); }
          80%  { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0; transform: translateY(10px); }
        }

        @media (max-width: 900px) {
          .lm-nav { padding: 0 28px; }
          .lm-nav-link span { display: none; }
        }
        @media (max-width: 640px) {
          .lm-nav { padding: 0 20px; }
          .lm-nav-links, .lm-nav-cta { display: none; }
          .lm-burger { display: flex; }
          .hero-section { padding: 60px 20px 80px; min-height: 100svh; }
          .hero-h1 { font-size: 36px; }
          .hero-sub { font-size: 15px; }
          .search-form { padding: 4px 4px 4px 14px; }
          .cats { gap: 6px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="lm-nav">
        <Link href="/" className="lm-logo">
          <div className="lm-logo-mark">
            <Store size={16} color="#0F1A14" strokeWidth={2.5} />
          </div>
          <span className="lm-logo-text">Link<em>Mall</em></span>
        </Link>

        <div className="lm-nav-links">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`lm-nav-link${pathname === href ? ' active' : ''}`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <Link href="/auth/login" className="lm-nav-cta">Sign in</Link>

        <button
          className="lm-burger"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`lm-mobile-menu${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="lm-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <Link
          href="/auth/login"
          className="lm-mobile-link"
          onClick={() => setMobileOpen(false)}
          style={{ color: '#D4ED47' }}
        >
          Sign in
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner">

          <div className="hero-badge">
            <span className="badge-pulse" />
            Kenya's #1 Event Marketplace
          </div>

          <h1 className="hero-h1">
            Find the perfect<br />
            <span className="accent">venue & team</span><br />
            for your event
          </h1>

          <p className="hero-sub">
            Browse verified venues, caterers, and hospitality vendors across Kenya.
            Book with confidence, pay securely via M-Pesa.
          </p>

          <div className="search-wrap">
            <form className="search-form" onSubmit={handleSearch}>
              <Search size={16} />
              <input
                className="search-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search venues, caterers, photographers..."
              />
              <button type="submit" className="search-btn">
                Search <ArrowRight size={13} />
              </button>
            </form>
          </div>

          <div className="cats">
            {CATEGORIES.map(c => (
              <Link
                key={c.value}
                href={`/listings?category=${c.value}`}
                className="cat-pill"
              >
                <span className="cat-pill-icon">{c.icon}</span>
                <span className="cat-pill-label">{c.label}</span>
                <span className="cat-pill-count">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div
          className="scroll-hint"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="scroll-dot">
            <div className="scroll-dot-inner" />
          </div>
          <span className="scroll-label">Scroll</span>
        </div>
      </section>
    </div>
  );
}