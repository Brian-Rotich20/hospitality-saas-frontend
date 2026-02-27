'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Settings,
  ArrowRight,
} from 'lucide-react';

const quickLinks = [
  {
    id: 'create-listing',
    title: 'Create Listing',
    description: 'Add a new listing',
    href: '/my-listings/create',
    icon: Plus,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'view-listings',
    title: 'My Listings',
    description: 'Manage your listings',
    href: '/my-listings',
    icon: Eye,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'bookings',
    title: 'Pending Bookings',
    description: 'Review booking requests',
    href: '/my-bookings',
    icon: Calendar,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Check your performance',
    href: '/analytics',
    icon: BarChart3,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
];

export function QuickAccessWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.id}
            href={link.href}
            className={`${link.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br ${link.color}`}
              >
                <Icon size={24} className="text-white" />
              </div>
              <ArrowRight
                size={20}
                className="text-gray-400 group-hover:text-gray-600 transition"
              />
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{link.title}</h3>
            <p className="text-sm text-gray-600">{link.description}</p>
          </Link>
        );
      })}
    </div>
  );
}