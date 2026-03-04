'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../lib/auth/auth.context';
import { listingsService, availabilityService } from '../../../../lib/api/endpoints';
import { Listing } from '../../../../lib/types';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated && id) {
      fetchListing();
    }
  }, [id, isAuthenticated, authLoading, router]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch listing details
      const response = await listingsService.getById(id);
      setListing(response.data);

      // Fetch blocked dates for this listing
      // This endpoint should return blocked dates
      // const availResponse = await availabilityService.getAvailability(id);
      // setBlockedDates(availResponse.data.blockedDates || []);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    try {
      setError(null);
      
      // Call API with ISO date strings
      await availabilityService.blockDates(id, startDate, endDate);

      // Add to local blocked dates
      setBlockedDates((prev) => [...prev, startDate, endDate]);
      
      setSuccess('Dates blocked successfully');
      setStartDate('');
      setEndDate('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error blocking dates:', err);
      setError('Failed to block dates');
    }
  };

  const handleUnblockDates = async (dateToRemove: string) => {
    try {
      setError(null);

      // Call API to unblock
      // This assumes unblockDates endpoint exists
      await availabilityService.unblockDates(id, dateToRemove, dateToRemove);

      setBlockedDates((prev) => prev.filter((d) => d !== dateToRemove));
      setSuccess('Date unblocked successfully');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error unblocking date:', err);
      setError('Failed to unblock date');
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading availability..." />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Listing not found
          </h1>
          <Link
            href="/my-listings"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href={`/my-listings/${id}`}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-600 mt-2">
            Manage when your listing is available for bookings
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900">
            <strong>{listing.title}</strong> - Block dates when you're not
            available to accept bookings
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
            <AlertCircle
              size={20}
              className="text-red-600 shrink-0 mt-0.5"
            />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Block Dates Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Block Dates</h2>
          <p className="text-gray-600">
            Select a date range when your listing should not be available for
            bookings
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null); // Clear error when user updates
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cannot select past dates
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be after from date
              </p>
            </div>
          </div>

          <button
            onClick={handleBlockDates}
            disabled={!startDate || !endDate}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
              startDate && endDate
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Block Dates
          </button>
        </div>

        {/* Blocked Dates Section */}
        {blockedDates.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Blocked Dates ({blockedDates.length})
            </h2>
            <p className="text-gray-600">
              Customers cannot book these dates
            </p>

            <div className="space-y-2">
              {blockedDates.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700 font-medium">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={() => handleUnblockDates(date)}
                    className="px-4 py-2 text-red-600 hover:text-red-700 font-semibold text-sm hover:bg-red-50 rounded transition"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {blockedDates.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No blocked dates</p>
            <p className="text-sm text-gray-500 mt-1">
              Block dates above to prevent bookings during specific periods
            </p>
          </div>
        )}

        {/* Calendar Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calendar View</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              📅 Interactive calendar view coming soon
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For now, use the date picker above to manage your availability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}