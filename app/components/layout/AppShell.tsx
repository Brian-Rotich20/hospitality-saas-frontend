'use client';

// Shared signed-in shell for the customer, vendor, admin and messaging areas: the role
// sidebar plus a slim top bar. Everything in the top bar is real: there are no in-app
// notifications in the backend (email only), so there is no bell.

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, MessageSquare } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../lib/auth/auth.context';
import { useProfile } from '../../lib/hooks/useProfile';
import { useUnreadCount } from '../../lib/messaging/unread';
import { VendorStatusBanner } from '../vendor/VendorStatusBanner';

const ACCOUNT_HREF = { vendor: '/vendor/settings/account', customer: '/customer/account/profile', admin: '/admin/settings' } as const;

function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const profile = useProfile();
  const role = (user?.role ?? 'customer') as keyof typeof ACCOUNT_HREF;
  const unread = useUnreadCount(role !== 'admin' && !!user);
  const name = profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-primary text-white h-16 px-4 md:px-6 flex items-center gap-3 shadow-[0_2px_8px_rgba(3,2,7,0.12)]">
      <button onClick={onMenu} aria-label="Open menu"
        className="lg:hidden w-10 h-10 -ml-1 flex items-center justify-center rounded-lg text-white hover:bg-white/10">
        <Menu size={18} />
      </button>
      <Link href="/store" className="lg:hidden flex items-center gap-2 no-underline" aria-label="LinkMart home">
        <Image src="/images/mark.png" alt="" width={30} height={30} className="w-[30px] h-[30px] rounded-full" />
        <span className="hidden min-[400px]:block text-[18px] font-bold tracking-[-0.02em] text-white">LinkMart</span>
      </Link>
      <div className="flex-1" />

      {role !== 'admin' && (
        <Link href="/messages" aria-label={unread ? `Messages, ${unread} unread` : 'Messages'}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary no-underline transition-transform hover:scale-105">
          <MessageSquare size={17} aria-hidden />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand ring-2 ring-primary" aria-hidden />}
        </Link>
      )}

      <Link href={ACCOUNT_HREF[role]} className="flex items-center gap-2.5 min-w-0 no-underline rounded-full pr-2 hover:bg-white/10">
        <span className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary text-[15px] font-bold">{name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="hidden sm:block text-[14px] font-semibold text-white truncate max-w-[160px]">{name}</span>
      </Link>
    </header>
  );
}

export function AppShell({ children, width = 1100 }: { children: React.ReactNode; width?: number }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-page">
      <Sidebar mobileOpen={open} onMobileClose={() => setOpen(false)} />
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <AppTopbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6 w-full mx-auto" style={{ maxWidth: width }}>
          {user?.role === 'vendor' && <VendorStatusBanner />}
          {children}
        </main>
      </div>
    </div>
  );
}
