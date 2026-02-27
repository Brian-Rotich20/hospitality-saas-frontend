'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  Calendar,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth.context';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  color?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function VendorSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainNavigation: NavSection[] = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: <Home size={20} />,
          color: 'primary',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'listings',
          label: 'My Listings',
          href: '/my-listings',
          icon: <Package size={20} />,
          color: 'blue',
        },
        {
          id: 'bookings',
          label: 'Bookings',
          href: '/my-bookings',
          icon: <Calendar size={20} />,
          badge: 2, // Example: 2 pending
          color: 'yellow',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/analytics',
          icon: <BarChart3 size={20} />,
          color: 'green',
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          id: 'profile',
          label: 'Profile & Settings',
          href: '/profile',
          icon: <Settings size={20} />,
          color: 'purple',
        },
        {
          id: 'messages',
          label: 'Messages',
          href: '/messages',
          icon: <MessageSquare size={20} />,
          color: 'cyan',
        },
        {
          id: 'support',
          label: 'Help & Support',
          href: '/support',
          icon: <HelpCircle size={20} />,
          color: 'gray',
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold">
            V
          </div>
          <div>
            <h2 className="font-bold text-gray-900">VenueHub</h2>
            <p className="text-xs text-gray-600">Vendor Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {mainNavigation.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      active
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`${
                          active
                            ? 'text-primary-600'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => {
            logout();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-linea-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          <span className="font-bold text-gray-900">VenueHub</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          {isMobileOpen ? (
            <X size={24} className="text-gray-600" />
          ) : (
            <Menu size={24} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white z-40 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '64px' }}
      >
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:bg-white lg:border-r lg:border-gray-200 lg:z-30">
        <NavContent />
      </div>
    </>
  );
}