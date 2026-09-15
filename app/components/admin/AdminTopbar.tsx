'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/vendors':   'Vendor Management',
  '/admin/listings':  'Listings',
  '/admin/bookings':  'Bookings',
  '/admin/analytics': 'Analytics',
};

export function AdminTopbar({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const profile  = useProfile();

  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] ?? 'Admin';

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-page border-b border-border px-4 py-3 flex items-center gap-3">
      <button onClick={onMobileMenuToggle} aria-label="Toggle menu"
        className="lg:hidden shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
          hover:bg-card border border-transparent hover:border-border transition text-text-secondary">
        <Menu size={16} />
      </button>

      <Link href="/admin/settings/account" className="flex items-center gap-2 min-w-0 no-underline shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-muted shrink-0">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-secondary text-xs font-extrabold">{initial}</span>
          )}
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-[13px] font-extrabold text-text-primary m-0 leading-tight truncate flex items-center gap-1">
            {displayName}
            <ChevronDown size={11} className="text-text-muted shrink-0" />
          </p>
        </div>
      </Link>

      <div className="hidden sm:block w-px h-5 bg-border shrink-0" />

      <h1 className="text-sm font-black text-text-primary flex-1 min-w-0 truncate">{title}</h1>

      <button aria-label="Notifications"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
        hover:bg-card border border-transparent hover:border-border transition text-text-muted">
        <Bell size={15} />
      </button>
    </header>
  );
}