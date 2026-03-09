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
    );
  }

  const dashboardHref =
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
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-gray-50 border border-gray-200
          rounded-full hover:border-[#2D3B45] hover:bg-white transition-colors cursor-pointer">
        <span className="text-xs font-semibold text-gray-700 max-w-[64px] truncate hidden sm:block">
          {user?.email?.split('@')[0]}
        </span>
        <div className="w-7 h-7 rounded-full bg-[#2D3B45] flex items-center justify-center
          text-[#F5C842] text-xs font-black shrink-0">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-gray-200
          rounded-2xl shadow-xl overflow-hidden z-50">

          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C842]
              bg-[#2D3B45] px-2 py-0.5 rounded-md inline-block mb-1">
              {user?.role ?? 'Member'}
            </span>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>

          {menuItems.map(({ href, Icon, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
                text-gray-700 hover:bg-gray-50 no-underline transition-colors">
              <Icon size={13} className="text-gray-400" />
              {label}
            </Link>
          ))}

          <div className="h-px bg-gray-100" />

          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
              text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}