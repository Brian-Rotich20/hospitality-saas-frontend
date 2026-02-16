'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import {
  LayoutDashboard,
  Package,
  Calendar,
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  LogOut,
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

interface SidebarProps {
  role?: UserRole;
}

export function Sidebar({ role = 'customer' }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = navigationByRole[role];

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}