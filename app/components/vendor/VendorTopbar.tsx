'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth.context';
import { Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function VendorTopbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(2); // Example: 2 notifications

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Left: Breadcrumb/Title (auto-populated by pages) */}
        <div className="flex-1">
          {/* Pages will pass their own title */}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 md:space-x-3 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email?.split('@')[0] || 'Vendor'}
                </p>
                <p className="text-xs text-gray-500">Vendor</p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Vendor Account</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/vendor/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} />
                    <span className="text-sm">Profile Settings</span>
                  </Link>

                  <a
                    href="/vendor/support"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <HelpCircle size={16} />
                    <span className="text-sm">Help & Support</span>
                  </a>

                  <div className="border-t border-gray-200 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}