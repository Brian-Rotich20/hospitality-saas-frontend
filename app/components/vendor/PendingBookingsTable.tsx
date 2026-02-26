'use client';

import React, { useState } from 'react';
import { Booking } from '../../lib/types';
import { CheckCircle, XCircle, Calendar, Users, MessageSquare } from 'lucide-react';
import { formatDate } from '../../lib/utils/format';

interface PendingBookingsTableProps {
  bookings: Booking[];
  onAccept: (bookingId: string) => Promise<void>;
  onDecline: (bookingId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function PendingBookingsTable({
  bookings,
  onAccept,
  onDecline,
  loading = false,
}: PendingBookingsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleAccept = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await onAccept(bookingId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await onDecline(bookingId, declineReason);
      setDeclineModal(null);
      setDeclineReason('');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  if (pendingBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up! 🎉</h3>
        <p className="text-gray-600">
          You don't have any pending booking requests. New requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Pending Booking Requests
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingBookings.length} request{pendingBookings.length !== 1 ? 's' : ''} awaiting
            your response
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-t border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Listing
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
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingBookings.map((booking) => (
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
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.customerEmail || 'N/A'}
                      </p>
                    </div>
                  </td>

                  {/* Listing */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 max-w-xs truncate">
                      {booking.listingTitle || 'Listing'}
                    </p>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <Calendar size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
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

                  {/* Requests */}
                  <td className="px-6 py-4">
                    {booking.specialRequests ? (
                      <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span className="text-xs">View</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={processingId === booking.id || loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 flex items-center space-x-1"
                      >
                        <CheckCircle size={16} />
                        <span className="text-sm">Accept</span>
                      </button>
                      <button
                        onClick={() => setDeclineModal(booking.id)}
                        disabled={processingId === booking.id || loading}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decline Modal */}
      {declineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Decline Booking Request
            </h3>
            <p className="text-gray-600 mb-4">
              Please let the customer know why you're declining this request.
            </p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Dates not available, capacity exceeded, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeclineModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecline(declineModal, declineReason)}
                disabled={!declineReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}