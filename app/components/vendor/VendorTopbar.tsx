'use client';

import Link from 'next/link';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';

export function VendorTopbar() {
  const { user } = useAuth();
  const profile  = useProfile();

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Vendor';
  const initial      = displayName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-20 bg-transparent pl-16 pr-4 py-4 lg:pl-7 lg:pr-7 lg:pt-6 lg:pb-2
      flex items-center justify-between gap-3">

      <Link href="/vendor/settings/account" className="flex items-center gap-2.5 no-underline min-w-0 shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-surface-muted shrink-0">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-secondary text-[13px] font-extrabold">{initial}</span>
          )}
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-[13px] font-extrabold text-text-primary m-0 leading-tight flex items-center gap-1 truncate">
            {displayName}
            <ChevronDown size={12} className="text-text-muted shrink-0" />
          </p>
          <p className="text-[11px] text-text-muted m-0 leading-tight truncate">{user?.email}</p>
        </div>
      </Link>

      <div className="hidden lg:flex flex-1 min-w-0 max-w-[260px] items-center gap-2
        bg-card border border-border rounded-full px-3.5 py-2.5">
        <Search size={13} className="text-text-muted shrink-0" />
        <input
          placeholder="Search..."
          className="border-none bg-transparent outline-none text-xs text-text-secondary w-full min-w-0"
        />
      </div>

      <button aria-label="Notifications"
        className="w-9 h-9 rounded-full border border-border bg-card
        flex items-center justify-center relative shrink-0 text-text-secondary hover:border-brand transition-colors">
        <Bell size={15} />
        <span className="absolute top-1.5 right-[7px] w-1.5 h-1.5 rounded-full bg-error border-[1.5px] border-card" />
      </button>
    </div>
  );
}