'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService } from '../../lib/api/endpoints';
import { DateRangePicker } from './DateRangePicker';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, FileText } from 'lucide-react';

interface BookingFormProps {
  listingId: string;
  basePrice: number;
  title: string;
  capacity: number;
}

export function BookingForm({
  listingId,
  basePrice,
  title,
  capacity,
}: BookingFormProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate price
  const nights = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const baseAmount = basePrice * nights;
  const platformFee = Math.round(baseAmount * 0.1); // 10% platform fee
  const vat = Math.round((baseAmount + platformFee) * 0.16); // 16% VAT
  const totalAmount = baseAmount + platformFee + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (guests < 1 || guests > capacity) {
      setError(`Guests must be between 1 and ${capacity}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await bookingsService.create({
        listingId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        guests,
        specialRequests,
      });

      // Redirect to confirmation page
      router.push(`/bookings/${response.data.id}/confirmation`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating your booking..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

      {/* Listing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>{title}</strong>
          <br />
          <span className="text-blue-700">
            Base price: KSh {basePrice.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Date Range */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        disabled={loading}
      />

      {/* Guests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Guests
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="number"
            min="1"
            max={capacity}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Maximum capacity: {capacity} guests
        </p>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            disabled={loading}
            placeholder="e.g., Early check-in, dietary restrictions, decorations needed..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Base price × {nights} night{nights !== 1 ? 's' : ''}
            </span>
            <span className="font-medium">
              KSh {baseAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform fee (10%)</span>
            <span className="font-medium">KSh {platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (16%)</span>
            <span className="font-medium">KSh {vat.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="font-bold text-lg text-primary-600">
              KSh {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Warning if not authenticated */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            You'll be redirected to login to complete your booking.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !startDate || !endDate}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white
          transition duration-200
          ${
            loading || !startDate || !endDate
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
          }
          flex items-center justify-center space-x-2
        `}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Request Booking - KSh {totalAmount.toLocaleString()}</span>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By booking, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:underline">
          Terms & Conditions
        </a>
      </p>
    </form>
  );
}