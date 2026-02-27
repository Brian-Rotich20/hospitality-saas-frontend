'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService } from '../../lib/api/endpoints';
import { Booking } from '../../lib/types';
import { PendingBookingsTable } from '../../components/vendor/PendingBookingsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

export default function VendorPendingBookingsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && user?.role !== 'vendor') {
      router.push('/dashboard');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchPendingBookings();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.getPendingBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
      setError('Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setError(null);
      await bookingsService.accept(bookingId);
      setSuccess('Booking accepted successfully!');
      setBookings(bookings.filter((b) => b.id !== bookingId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to accept booking';
      setError(errorMsg);
    }
  };

  const handleDecline = async (bookingId: string, reason: string) => {
    try {
      setError(null);
      await bookingsService.decline(bookingId, reason );
      setSuccess('Booking declined successfully!');
      setBookings(bookings.filter((b) => b.id !== bookingId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to decline booking';
      setError(errorMsg);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading pending bookings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Pending Bookings</h1>
          <p className="text-gray-600 mt-2">
            Review and respond to booking requests from customers
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            ✅ {success}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📌 Pro Tips</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              • Respond to bookings within 24 hours to improve your response rate
            </li>
            <li>
              • Be clear when declining to help customers understand your availability
            </li>
            <li>
              • Accepted bookings will move to your confirmed bookings list
            </li>
          </ul>
        </div>
       

        {/* Pending Bookings Table */}
        <PendingBookingsTable
          bookings={bookings}
          onAccept={handleAccept}
          onDecline={handleDecline}
          loading={loading}
        />
      </div>
    </div>
  );
}