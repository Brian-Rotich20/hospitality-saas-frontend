'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { Store, LogOut } from 'lucide-react';

interface NavLink { href: string; Icon: React.ElementType; label: string; }
interface MobileDrawerProps {
  navLinks: NavLink[];
  isAuthenticated: boolean;
  onClose: () => void;
}

export function MobileDrawer({ navLinks, onClose }: MobileDrawerProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const role = isAuthenticated ? user?.role : undefined;

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  // Where "list a service" leads depends on who is asking; admins can't become vendors.
  const listHref = role === 'vendor' ? '/vendor/listings/new' : role === 'customer' ? '/vendor/onboarding' : role ? null : '/auth/register-vendor';
  const loginHref = pathname.startsWith('/auth') ? '/auth/login' : `/auth/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <nav className="lg:hidden border-t border-border bg-card pb-3" aria-label="Menu">
      {navLinks.map(({ href, Icon, label }) => (
        <Link key={href} href={href} onClick={onClose} aria-current={isActive(href) ? 'page' : undefined}
          className={`flex items-center gap-3 px-5 py-3 text-[15px] font-medium no-underline transition-colors
            ${isActive(href) ? 'text-text-primary bg-surface-muted' : 'text-text-secondary hover:bg-surface-muted'}`}>
          <Icon size={17} aria-hidden />
          {label}
        </Link>
      ))}

      {listHref && (
        <>
          {navLinks.length > 0 && <div className="h-px bg-border my-2 mx-4" />}
          <Link href={listHref} onClick={onClose}
            className="flex items-center gap-3 px-5 py-3 text-[15px] font-semibold text-text-primary no-underline hover:bg-surface-muted">
            <Store size={17} aria-hidden />
            {role === 'vendor' ? 'Add a listing' : 'List your business'}
          </Link>
        </>
      )}

      {isAuthenticated ? (
        <>
          <div className="h-px bg-border my-2 mx-4" />
          <button onClick={() => { onClose(); void logout(); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-error hover:bg-error-bg transition-colors">
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </>
      ) : (
        <div className="px-4 pt-2 flex flex-col gap-2">
          <Link href={loginHref} onClick={onClose}
            className="flex items-center justify-center h-11 border border-border-strong rounded-xl text-[15px] font-semibold text-text-primary no-underline hover:bg-surface-muted">
            Sign in
          </Link>
          <Link href="/auth/register" onClick={onClose}
            className="flex items-center justify-center h-11 bg-ink rounded-xl text-[15px] font-semibold text-white no-underline hover:bg-ink-hover">
            Create an account
          </Link>
        </div>
      )}
    </nav>
  );
}
