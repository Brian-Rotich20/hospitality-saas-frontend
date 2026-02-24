'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService } from '../../../../lib/api/endpoints';
import { Booking } from '../../../../lib/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../../components/common/EmptyState';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { Calendar, MapPin } from 'lucide-react';
import { formatDate } from '../../../../lib/utils/format';

export default function MyBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading your bookings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage all your bookings in one place
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <EmptyState
            message="No bookings yet"
            description="Start exploring listings and make your first booking"
            icon="package"
            action={{
              label: 'Browse Listings',
              onClick: () => router.push('/listings'),
            }}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/my-bookings/${booking.id}`}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Listing Title */}
                    <div className="md:col-span-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {booking.listingTitle || 'Listing'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking ID: {booking.id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="md:col-span-1">
                      <div className="flex items-start space-x-2">
                        <Calendar
                          size={16}
                          className="text-gray-400 flex-shrink-0 mt-1"
                        />
                        <div>
                          <p className="text-sm text-gray-600">Dates</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatDate(new Date(booking.startDate))} -{' '}
                            {formatDate(new Date(booking.endDate))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Guests & Amount */}
                    <div className="md:col-span-1 space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="font-semibold text-gray-900">
                          {booking.guests}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-primary-600">
                          KSh {booking.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1 flex items-end justify-start md:justify-end">
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
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Special Requests
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}