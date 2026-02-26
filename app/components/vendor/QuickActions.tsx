'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Eye, BarChart3, Settings } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      id: 'create-listing',
      title: 'Create Listing',
      description: 'Add a new venue, catering, or accommodation',
      href: '/vendor/my-listings/create',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'view-listings',
      title: 'My Listings',
      description: 'Manage and edit your listings',
      href: '/vendor/my-listings',
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View performance and earnings',
      href: '/vendor/analytics',
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'settings',
      title: 'Profile Settings',
      description: 'Update your business information',
      href: '/vendor/profile',
      icon: Settings,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.id} href={action.href}>
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition cursor-pointer h-full">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br ${action.color} mb-4`}
                >
                  <Icon size={24} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 text-sm">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2">{action.description}</p>

                {/* Arrow */}
                <div className="mt-4 flex items-center space-x-1 text-primary-600 text-sm font-medium">
                  <span>Go</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}