'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing } from '../../lib/types';
import { VendorListingsTable } from '../../components/vendor/VendorListingsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertCircle, Filter } from 'lucide-react';

export default function VendorMyListingsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

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
      fetchListings();
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Filter listings
  useEffect(() => {
    let filtered = listings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((l) => l.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((l) =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  }, [listings, filterStatus, searchTerm]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsService.getVendorListings();
      setListings(response.data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await listingsService.deleteListing(listingId);
      setSuccess('Listing deleted successfully!');
      setListings(listings.filter((l) => l.id !== listingId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete listing';
      setError(errorMsg);
    }
  };

  const handleToggleStatus = async (
    listingId: string,
    status: 'active' | 'paused'
  ) => {
    try {
      await listingsService.updateListingStatus(listingId, status);
      setSuccess(
        `Listing ${status === 'active' ? 'activated' : 'paused'} successfully!`
      );
      setListings(
        listings.map((l) => (l.id === listingId ? { ...l, status } : l))
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to update listing status';
      setError(errorMsg);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading your listings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your listings to attract customers
            </p>
          </div>
          <Link
            href="/vendor/my-listings/create"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            + Create Listing
          </Link>
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
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Listings
              </label>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as 'all' | 'active' | 'paused')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Listings</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredListings.length} of {listings.length} listing
            {listings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Listings Table */}
        <VendorListingsTable
          listings={filteredListings}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </div>
    </div>
  );
}