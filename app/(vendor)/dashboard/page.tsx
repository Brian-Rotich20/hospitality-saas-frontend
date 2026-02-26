// Vendor home
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { vendorsService, bookingsService } from '../../lib/api/endpoints';
import { Booking } from '../../lib/types';
import { VendorStats } from '../../components/vendor/VendorStats';
import { RecentBookingsPreview } from '../../components/vendor/RecentBookingsPreview';
import { QuickActions } from '../../components/vendor/QuickActions';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface VendorStats {
  totalBookings: number;
  pendingBookings: number;
  revenueThisMonth: number;
  averageRating: number;
}

export default function VendorDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<VendorStats>({
    totalBookings: 0,
    pendingBookings: 0,
    revenueThisMonth: 0,
    averageRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendor stats
      const statsResponse = await vendorsService.getStats();
      setStats(statsResponse.data);

      // Fetch recent bookings
      const bookingsResponse = await bookingsService.getVendorBookings();
      setRecentBookings(bookingsResponse.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, Vendor! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your listings and bookings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div>
          <VendorStats
            totalBookings={stats.totalBookings}
            pendingBookings={stats.pendingBookings}
            revenueThisMonth={stats.revenueThisMonth}
            averageRating={stats.averageRating}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>

        {/* Recent Bookings */}
        <div>
          <RecentBookingsPreview bookings={recentBookings} loading={loading} />
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            Need Help? 🤔
          </h2>
          <p className="text-blue-800 mb-4">
            Check out our vendor guide to maximize your bookings and earnings.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              View Guide
            </button>
            <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}