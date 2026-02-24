'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingsService } from '../../../../lib/api/endpoints';
import { Booking } from '../../../../lib/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { CheckCircle, Calendar, Users, MapPin, DollarSign } from 'lucide-react';
import { formatDate } from '../../../../lib/utils/format';

interface BookingConfirmationProps {
  params: {
    id: string;
  };
}

export default function BookingConfirmationPage({
  params,
}: BookingConfirmationProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingsService.getById(params.id);
        setBooking(response.data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner fullPage text="Loading booking details..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Booking not found'}
          </p>
          <Link
            href="/listings"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to Listings
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Your booking request has been submitted successfully
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Booking ID */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-xl font-bold text-gray-900 font-mono">
              {booking.id}
            </p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Check-in Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Check-In</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(startDate)}
                </p>
              </div>
            </div>

            {/* Check-out Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Check-Out</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(endDate)}
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start space-x-3">
              <Users className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-semibold text-gray-900">
                  {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  {booking.status === 'pending' ? 'Awaiting Confirmation' : booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mb-8 pb-8 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Special Requests
              </p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base amount</span>
                <span className="font-medium">
                  KSh {booking.baseAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform fee</span>
                <span className="font-medium">
                  KSh {booking.platformFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (16%)</span>
                <span className="font-medium">
                  KSh {booking.vat.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-primary-600">
                  KSh {booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>
              <span className="font-semibold">1.</span> The vendor will review your
              booking request within 24 hours
            </li>
            <li>
              <span className="font-semibold">2.</span> You'll receive an email
              confirmation
            </li>
            <li>
              <span className="font-semibold">3.</span> Once confirmed, payment details
              will be provided
            </li>
            <li>
              <span className="font-semibold">4.</span> Complete payment to finalize
              your booking
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/customer/my-bookings"
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center"
          >
            View My Bookings
          </Link>
          <Link
            href="/listings"
            className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition text-center"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}