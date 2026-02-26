'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { vendorsService, bookingsService } from '../../lib/api/endpoints';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Eye,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  responseRate: number;
  totalViews: number;
  conversionRate: number;
}

export default function VendorAnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    responseRate: 0,
    totalViews: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

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
      fetchAnalytics();
    }
  }, [isAuthenticated, authLoading, user, router, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking data
      const bookingsResponse = await bookingsService.getVendorBookings();
      const bookings = bookingsResponse.data || [];

      const completed = bookings.filter((b) => b.status === 'completed').length;
      const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
      const pending = bookings.filter((b) => b.status === 'pending').length;

      const totalRevenue = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      // Fetch stats
      const statsResponse = await vendorsService.getStats();
      const stats = statsResponse.data;

      setAnalytics({
        totalBookings: bookings.length,
        completedBookings: completed,
        cancelledBookings: cancelled,
        totalRevenue,
        averageRating: stats.averageRating,
        responseRate: pending === 0 ? 100 : ((bookings.length - pending) / bookings.length) * 100,
        totalViews: bookings.length * 15, // Mock data
        conversionRate:
          bookings.length > 0 ? (completed / bookings.length) * 100 : 0,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading analytics..." />;
  }

  const metrics = [
    {
      id: 'bookings',
      label: 'Total Bookings',
      value: analytics.totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: `KSh ${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'rating',
      label: 'Average Rating',
      value: analytics.averageRating.toFixed(1),
      suffix: '/ 5.0',
      icon: ThumbsUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'response',
      label: 'Response Rate',
      value: analytics.responseRate.toFixed(0),
      suffix: '%',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const detailedMetrics = [
    {
      label: 'Completed Bookings',
      value: analytics.completedBookings,
      description: 'Bookings that were fulfilled',
      color: 'text-green-600',
    },
    {
      label: 'Cancelled Bookings',
      value: analytics.cancelledBookings,
      description: 'Cancelled by customer',
      color: 'text-red-600',
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.conversionRate.toFixed(1)}%`,
      description: 'Bookings relative to inquiries',
      color: 'text-blue-600',
    },
    {
      label: 'Total Views',
      value: analytics.totalViews,
      description: 'Listing views this period',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Track your performance and growth metrics
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeframe === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className={`${metric.bgColor} rounded-lg p-6 border-l-4 border-l-transparent shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metric.value}
                      {metric.suffix && (
                        <span className="text-xl font-normal text-gray-600 ml-1">
                          {metric.suffix}
                        </span>
                      )}
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color}`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Metrics */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Detailed Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {detailedMetrics.map((metric, index) => (
              <div
                key={index}
                className="border-l-4 border-l-gray-300 pl-6 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Tips to Improve</h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <span>Respond to booking requests within 24 hours to improve response rate</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <span>Keep your listing photos high quality and description detailed</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <span>Encourage customers to leave reviews after completed bookings</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <span>Maintain competitive pricing compared to similar listings</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}