'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { X, LogOut } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Calendar,
  BarChart3,
  Users,
  User,
} from 'lucide-react';

type UserRole = 'customer' | 'vendor' | 'admin';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  customer: [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: '/bookings',
      label: 'My Bookings',
      icon: <Calendar size={20} />,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
  ],
  vendor: [
    {
      href: '/vendor/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: '/vendor/listings',
      label: 'My Listings',
      icon: <Package size={20} />,
    },
    {
      href: '/vendor/bookings',
      label: 'Bookings',
      icon: <Calendar size={20} />,
    },
    {
      href: '/vendor/profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
    {
      href: '/vendor/analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
    },
  ],
  admin: [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: '/admin/vendors',
      label: 'Vendors',
      icon: <Users size={20} />,
    },
    {
      href: '/admin/bookings',
      label: 'Bookings',
      icon: <Calendar size={20} />,
    },
    {
      href: '/admin/listings',
      label: 'Listings',
      icon: <Package size={20} />,
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
    },
  ],
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
}

export function MobileNav({ isOpen, onClose, role = 'customer' }: MobileNavProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = navigationByRole[role];

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition
                ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}