'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Calendar, BarChart3, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';

const NAV = [
  {
    section: 'Main',
    items: [{ label: 'Dashboard',   href: '/vendor/dashboard',        icon: LayoutDashboard }],
  },
  {
    section: 'Management',
    items: [
      { label: 'My Listings', href: '/vendor/listings',         icon: Package   },
      { label: 'Bookings',    href: '/vendor/bookings',         icon: Calendar  },
      { label: 'Analytics',   href: '/vendor/analytics',        icon: BarChart3 },
    ],
  },
  {
    section: 'Account',
    items: [{ label: 'Settings', href: '/vendor/settings/profile', icon: Settings }],
  },
];

const S: Record<string, React.CSSProperties> = {
  font:    { fontFamily: 'DM Sans, system-ui, sans-serif' },
  logo:    { padding: '18px 18px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pill:    { padding: '10px 14px', borderBottom: '1px solid #F3F4F6' },
  pillBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#F8FAFC', borderRadius: 9, border: '1px solid #E5E7EB' },
  avatar:  { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 as const },
  nav:     { flex: 1, padding: '14px 10px', overflowY: 'auto' as const },
  footer:  { padding: '10px 10px 14px', borderTop: '1px solid #F3F4F6' },
};

function NavInner({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const initial  = user?.email?.charAt(0).toUpperCase() ?? 'V';
  const handle   = user?.email?.split('@')[0] ?? 'Vendor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', ...S.font }}>

      {/* Logo */}
      <div style={S.logo}>
        <Link href="/vendor/dashboard" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>V</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2 }}>LinkMall</div>
            <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Vendor Dashboard</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
            <X size={17} />
          </button>
        )}
      </div>

      {/* User pill */}
      <div style={S.pill}>
        <div style={S.pillBox}>
          <div style={S.avatar}>{initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</div>
            <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Active
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav style={S.nav}>
        {NAV.map(sec => (
          <div key={sec.section} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>{sec.section}</div>
            {sec.items.map(item => {
              const active = isActive(item.href);
              const Icon   = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 10px', borderRadius: 9, textDecoration: 'none', marginBottom: 2,
                  background: active ? '#111827' : 'transparent',
                  color: active ? '#fff' : '#6B7280',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                  </div>
                  {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={S.footer}>
        <button onClick={() => { logout(); onClose?.(); }} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', borderRadius: 9, border: 'none', background: 'none',
          cursor: 'pointer', color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

export function VendorSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile topbar */}
      <div className="vs-mobile-bar" style={{ display: 'none', position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        <Link href="/vendor/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>V</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>LinkMall</span>
        </Link>
        <button onClick={() => setOpen(true)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer' }}>
          <Menu size={20} color="#374151" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} className="vs-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 48 }} />}

      {/* Mobile drawer */}
      <div className="vs-drawer" style={{ position: 'fixed', top: 0, left: open ? 0 : '-270px', width: 252, height: '100dvh', background: '#fff', borderRight: '1px solid #E5E7EB', zIndex: 49, transition: 'left 0.22s ease', boxShadow: open ? '6px 0 32px rgba(0,0,0,0.1)' : 'none' }}>
        <NavInner onClose={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="vs-desktop" style={{ position: 'fixed', top: 0, left: 0, width: 228, height: '100dvh', background: '#fff', borderRight: '1px solid #E5E7EB', zIndex: 30 }}>
        <NavInner />
      </div>

      <style>{`
        @media (max-width: 1024px) { .vs-desktop { display: none !important; } .vs-mobile-bar { display: flex !important; } }
        @media (min-width: 1025px) { .vs-drawer { display: none !important; } .vs-overlay { display: none !important; } .vs-mobile-bar { display: none !important; } }
      `}</style>
    </>
  );
}