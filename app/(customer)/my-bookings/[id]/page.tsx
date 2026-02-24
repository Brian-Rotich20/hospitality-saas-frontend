// My bookings page
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService } from '../../../lib/api/endpoints';
import { Booking } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react';
import { formatDate } from '../../../lib/utils/format';

interface BookingDetailProps {
  params: {
    id: string;
  };
}

export default function BookingDetailPage({ params }: BookingDetailProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchBooking();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.getById(params.id);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading booking..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Booking not found'}
          </h1>
          <Link
            href="/customer/my-bookings"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to my bookings
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const nights = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/customer/my-bookings"
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to my bookings</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {booking.listingTitle || 'Booking Details'}
              </h1>
              <p className="text-gray-600 font-mono text-sm">
                Booking ID: {booking.id}
              </p>
            </div>
            <StatusBadge
              status={
                booking.status as
                  | 'pending'
                  | 'confirmed'
                  | 'completed'
                  | 'cancelled'
                  | 'disputed'
              }
              size="lg"
            />
          </div>

          {/* Timeline Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Check-in */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Check-In Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(startDate)}
                </p>
              </div>
            </div>

            {/* Check-out */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Check-Out Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(endDate)}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start space-x-3">
              <Clock className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {nights} night{nights !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center space-x-3 pb-8 border-b border-gray-200">
            <Users className="text-primary-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Number of Guests</p>
              <p className="font-semibold text-gray-900">
                {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mt-8">
              <div className="flex items-start space-x-3">
                <FileText className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Special Requests
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded">
                    {booking.specialRequests}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Price Breakdown
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Base price × {nights} night{nights !== 1 ? 's' : ''}
              </span>
              <span className="font-medium text-gray-900">
                KSh {booking.baseAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform fee (10%)</span>
              <span className="font-medium text-gray-900">
                KSh {booking.platformFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">VAT (16%)</span>
              <span className="font-medium text-gray-900">
                KSh {booking.vat.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                KSh {booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p className="text-sm text-blue-900">
              <strong>Booking Status:</strong>
              {booking.status === 'pending' &&
                ' Your booking is awaiting confirmation from the vendor. You will receive an email notification once they respond.'}
              {booking.status === 'confirmed' &&
                ' Your booking has been confirmed! The vendor will contact you with further details.'}
              {booking.status === 'completed' &&
                ' This booking has been completed. Thank you for using our platform!'}
              {booking.status === 'cancelled' &&
                ' This booking has been cancelled.'}
              {booking.status === 'disputed' &&
                ' This booking has a dispute. Our support team will assist you.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {booking.status === 'pending' && (
          <div className="mt-8 flex gap-4">
            <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
              Cancel Booking
            </button>
            <button className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition">
              Contact Vendor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}