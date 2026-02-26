'use client';

import React from 'react';
import { TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';

interface VendorStatsProps {
  totalBookings: number;
  pendingBookings: number;
  revenueThisMonth: number;
  averageRating: number;
  loading?: boolean;
}

export function VendorStats({
  totalBookings,
  pendingBookings,
  revenueThisMonth,
  averageRating,
  loading = false,
}: VendorStatsProps) {
  const stats = [
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'pending-bookings',
      label: 'Pending Requests',
      value: pendingBookings,
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      highlight: pendingBookings > 0,
    },
    {
      id: 'revenue',
      label: 'Revenue This Month',
      value: `KSh ${revenueThisMonth.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      id: 'rating',
      label: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      suffix: '/ 5.0',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-lg p-6 border-l-4 ${
              stat.highlight ? 'border-l-red-500' : 'border-l-transparent'
            } shadow-sm hover:shadow-md transition`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? (
                    <span className="inline-block w-20 h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      {stat.value}
                      {stat.suffix && (
                        <span className="text-xl font-normal text-gray-600 ml-1">
                          {stat.suffix}
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color}`}
              >
                <Icon size={24} className="text-white" />
              </div>
            </div>

            {/* Footer */}
            {stat.id !== 'pending-bookings' && !loading && (
              <div className="text-xs text-gray-600">
                {stat.id === 'revenue' && '↑ Based on completed bookings'}
                {stat.id === 'total-bookings' && '↑ All time bookings'}
                {stat.id === 'rating' && '↑ From customer reviews'}
              </div>
            )}

            {stat.highlight && !loading && (
              <div className="mt-2 text-xs text-red-600 font-semibold">
                ⚠️ Action required
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}