'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { LogOut, User, Store, Bookmark } from 'lucide-react';

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/auth/login" className="btn btn-ghost btn-sm no-underline">
          Sign in
        </Link>
      </div>
    );
  }

  const dashboardHref  =
    user?.role === 'vendor' ? '/vendor/dashboard' :
    user?.role === 'admin'  ? '/admin/dashboard'  : '/dashboard';
  const dashboardLabel =
    user?.role === 'vendor' ? 'Vendor Dashboard' :
    user?.role === 'admin'  ? 'Admin Dashboard'  : 'Dashboard';

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  const menuItems = [
    { href: '/profile',    Icon: User,     label: 'My Account'   },
    { href: dashboardHref, Icon: Store,    label: dashboardLabel },
    { href: '/saved',      Icon: Bookmark, label: 'Saved'        },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="avatar-trigger">
        <span className="text-xs font-semibold hidden sm:block max-w-[64px] truncate"
          style={{ color: 'var(--color-text-secondary)' }}>
          {user?.email?.split('@')[0]}
        </span>
        <div className="avatar-circle">{initials}</div>
      </button>

      {open && (
        <div className="dropdown-card absolute right-0 w-48 z-50"
          style={{ top: 'calc(100% + 8px)' }}>

          {/* User info header */}
          <div className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="role-badge">{user?.role ?? 'Member'}</span>
            <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
              {user?.email}
            </p>
          </div>

          {/* Menu items */}
          {menuItems.map(({ href, Icon, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="dropdown-item">
              <Icon size={13} style={{ color: 'var(--color-text-muted)' }} />
              {label}
            </Link>
          ))}

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <button onClick={() => { logout(); setOpen(false); }}
            className="dropdown-item dropdown-item-danger">
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}