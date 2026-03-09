'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth.context';
import { Store, LogOut } from 'lucide-react';

interface NavLink {
  href:  string;
  Icon:  React.ElementType;
  label: string;
}

interface MobileDrawerProps {
  navLinks: NavLink[];
  onClose:  () => void;
}

export function MobileDrawer({ navLinks, onClose }: MobileDrawerProps) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="lg:hidden border-t border-gray-100 bg-white pb-3">
      {navLinks.map(({ href, Icon, label }) => (
        <Link key={href} href={href} onClick={onClose}
          className={`flex items-center gap-3 px-5 py-3 text-sm font-medium no-underline transition-colors
            ${isActive(href)
              ? 'text-[#2D3B45] bg-yellow-50 border-l-2 border-[#F5C842]'
              : 'text-gray-700 hover:bg-gray-50'}`}>
          <Icon size={16} />
          {label}
        </Link>
      ))}

      <div className="h-px bg-gray-100 my-2 mx-4" />

      <Link href="/vendor/listings/new" onClick={onClose}
        className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2D3B45] no-underline hover:bg-gray-50">
        <Store size={16} />
        + List a Service
      </Link>

      {isAuthenticated ? (
        <>
          <div className="h-px bg-gray-100 my-2 mx-4" />
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={15} />
            Logout
          </button>
        </>
      ) : (
        <div className="px-4 pt-2 flex flex-col gap-2">
          <Link href="/auth/login" onClick={onClose}
            className="block text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 no-underline hover:border-gray-400">
            Log in
          </Link>
          <Link href="/auth/register" onClick={onClose}
            className="block text-center py-2.5 bg-[#F5C842] rounded-xl text-sm font-bold text-[#2D3B45] no-underline hover:bg-yellow-400">
            Sign up free
          </Link>
        </div>
      )}
    </div>
  );
}