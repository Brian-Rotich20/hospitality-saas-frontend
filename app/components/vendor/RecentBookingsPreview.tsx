'use client';

import React from 'react';
import Link from 'next/link';
import { Booking } from '../../lib/types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils/format';

interface RecentBookingsPreviewProps {
  bookings: Booking[];
  loading?: boolean;
}

export function RecentBookingsPreview({
  bookings,
  loading = false,
}: RecentBookingsPreviewProps) {
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <p className="text-sm text-gray-600 mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="text-red-600 font-semibold ml-2">
                • {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <Link
          href="/vendor/my-bookings"
          className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
        >
          View All →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No bookings yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Your bookings will appear here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-t border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.customerName || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.id.slice(0, 8)}...
                      </p>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <div className="text-sm text-gray-700">
                        <p>{formatDate(new Date(booking.startDate))}</p>
                        <p className="text-xs text-gray-500">
                          to {formatDate(new Date(booking.endDate))}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Guests */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <Users size={16} className="text-gray-400" />
                      <span>{booking.guests}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      KSh {booking.totalAmount.toLocaleString()}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={
                        booking.status as
                          | 'pending'
                          | 'confirmed'
                          | 'completed'
                          | 'cancelled'
                          | 'disputed'
                      }
                    />
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    {booking.status === 'pending' ? (
                      <Link
                        href={`/vendor/my-bookings/${booking.id}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                      >
                        Review
                      </Link>
                    ) : (
                      <Link
                        href={`/vendor/my-bookings/${booking.id}`}
                        className="text-gray-600 hover:text-gray-700 font-semibold text-sm"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Alert */}
      {pendingCount > 0 && !loading && (
        <div className="bg-red-50 border-t border-red-200 p-4 flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">
              {pendingCount} Pending Booking{pendingCount !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-700 mt-1">
              You have booking requests awaiting your response. Review and respond
              quickly to improve your response rate.
            </p>
            <Link
              href="/vendor/my-bookings"
              className="text-red-600 hover:text-red-700 font-semibold text-sm mt-2 inline-block"
            >
              Review Now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}