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
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="lg:hidden border-t border-border bg-card pb-3">
      {navLinks.map(({ href, Icon, label }) => (
        <Link key={href} href={href} onClick={onClose}
          className={`flex items-center gap-3 px-5 py-3 text-sm font-medium no-underline transition-colors
            ${isActive(href)
              ? 'text-brand bg-accent-bg border-l-2 border-accent'
              : 'text-text-secondary hover:bg-surface-muted'}`}>
          <Icon size={16} />
          {label}
        </Link>
      ))}

      <div className="h-px bg-border my-2 mx-4" />

      <Link href="/vendor/listings/new" onClick={onClose}
        className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-brand no-underline hover:bg-surface-muted">
        <Store size={16} />
        + List a Service
      </Link>

      {isAuthenticated ? (
        <>
          <div className="h-px bg-border my-2 mx-4" />
          <button onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-error hover:bg-error-bg transition-colors">
            <LogOut size={15} />
            Logout
          </button>
        </>
      ) : (
        <div className="px-4 pt-2 flex flex-col gap-2">
          <Link href="/auth/login" onClick={onClose}
            className="block text-center py-2.5 border border-border rounded-xl text-sm font-medium text-text-secondary no-underline hover:border-brand">
            Log in
          </Link>
          <Link href="/auth/register" onClick={onClose}
            className="block text-center py-2.5 bg-accent rounded-xl text-sm font-bold text-brand no-underline hover:opacity-90">
            Sign up free
          </Link>
        </div>
      )}
    </div>
  );
}