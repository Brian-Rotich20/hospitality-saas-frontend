'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';

const LABELS: Record<string, string> = {
  '/vendor/dashboard':        'Dashboard',
  '/vendor/listings':         'My Listings',
  '/vendor/listings/create':  'Create Listing',
  '/vendor/bookings':         'Bookings',
  '/vendor/analytics':        'Analytics',
  '/vendor/settings/profile': 'Settings',
  '/vendor/settings/payout':  'Settings',
};

function getLabel(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname];
  if (pathname.includes('/listings/') && pathname.includes('/edit')) return 'Edit Listing';
  if (pathname.includes('/listings/')) return 'Listing Detail';
  if (pathname.includes('/bookings/')) return 'Booking Detail';
  return 'Vendor Portal';
}

interface Props {
  onMobileMenuToggle: () => void;
}

export function VendorTopbar({ onMobileMenuToggle }: Props) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const label    = getLabel(pathname);
  const initial  = user?.email?.charAt(0).toUpperCase() ?? 'V';
  const handle   = user?.email?.split('@')[0] ?? 'Vendor';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      padding: '0 16px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>

      {/* Left: hamburger (mobile) + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* ── Hamburger — only visible below lg ── */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden"
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid #E5E7EB', background: '#fff',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-label="Open menu"
        >
          <Menu size={16} color="#374151" />
        </button>

        <h2 style={{
          fontSize: 15, fontWeight: 800, color: '#111827',
          margin: 0, letterSpacing: '-0.02em',
        }}>
          {label}
        </h2>
      </div>

      {/* Right: bell + user menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* Bell */}
        <button style={{
          width: 34, height: 34, borderRadius: 8,
          border: '1px solid #E5E7EB', background: '#fff',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Bell size={15} color="#6B7280" />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 6, height: 6, borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #fff',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: '#E5E7EB', margin: '0 4px' }} />

        {/* User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 5px',
              border: '1px solid #E5E7EB', borderRadius: 9,
              background: menu ? '#F8FAFC' : '#fff',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0,
            }}>
              {initial}
            </div>
            {/* Name — hidden on small screens */}
            <div style={{ display: 'none' }} className="tb-name">
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', display: 'block', lineHeight: 1.2 }}>
                {handle}
              </span>
              <span style={{ fontSize: 10, color: '#9CA3AF', display: 'block' }}>Vendor</span>
            </div>
            <ChevronDown
              size={13} color="#9CA3AF"
              style={{ transform: menu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            />
          </button>

          {/* Dropdown */}
          {menu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              width: 200, background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden', zIndex: 60,
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{handle}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{user?.email}</div>
              </div>

              {[
                { icon: User,     label: 'Profile',  href: '/vendor/settings/profile' },
                { icon: Settings, label: 'Settings', href: '/vendor/settings/payout'  },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenu(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', textDecoration: 'none',
                  color: '#374151', fontSize: 13, fontWeight: 500,
                  borderBottom: '1px solid #F9FAFB',
                }}>
                  <item.icon size={14} color="#9CA3AF" />
                  {item.label}
                </Link>
              ))}

              <button onClick={() => { logout(); setMenu(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none', background: 'none',
                color: '#EF4444', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) { .tb-name { display: block !important; } }
      `}</style>
    </div>
  );
}