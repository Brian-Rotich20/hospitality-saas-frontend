'use client';

// Shared signed-in shell for the customer, vendor, admin and messaging areas: the role
// sidebar plus a slim top bar. Everything in the top bar is real: there are no in-app
// notifications in the backend (email only), so there is no bell.

import { useState } from 'react';
import Link from 'next/link';
import { Menu, MessageSquare } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';
import { useUnreadCount } from '../../lib/messaging/unread';

const ACCOUNT_HREF = { vendor: '/vendor/settings/account', customer: '/customer/account/profile', admin: '/admin/settings' } as const;

function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const profile = useProfile();
  const role = (user?.role ?? 'customer') as keyof typeof ACCOUNT_HREF;
  const unread = useUnreadCount(role !== 'admin' && !!user);
  const name = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-page/95 backdrop-blur-sm border-b border-border h-14 px-4 md:px-6 flex items-center gap-3">
      <button onClick={onMenu} aria-label="Open menu"
        className="lg:hidden w-9 h-9 -ml-1 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted">
        <Menu size={18} />
      </button>
      <div className="flex-1" />

      {role !== 'admin' && (
        <Link href="/messages" aria-label={unread ? `Messages, ${unread} unread` : 'Messages'}
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted no-underline">
          <MessageSquare size={17} aria-hidden />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-page" aria-hidden />}
        </Link>
      )}

      <Link href={ACCOUNT_HREF[role]} className="flex items-center gap-2.5 min-w-0 no-underline rounded-full pr-1 hover:bg-surface-muted">
        <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-muted shrink-0">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-text-secondary text-xs font-extrabold">{name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="hidden sm:block text-[13px] font-bold text-text-primary truncate max-w-[160px]">{name}</span>
      </Link>
    </header>
  );
}

export function AppShell({ children, width = 1100 }: { children: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-page">
      <Sidebar mobileOpen={open} onMobileClose={() => setOpen(false)} />
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <AppTopbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6 w-full mx-auto" style={{ maxWidth: width }}>
          {children}
        </main>
      </div>
    </div>
  );
}
