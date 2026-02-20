// Listing search and filters
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing } from '../../lib/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { LocationBadge } from '../../components/common/LocationBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { Search, Filter, Package } from 'lucide-react';

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    capacity: searchParams.get('capacity') || '',
  });

  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await listingsService.getAll({
          search: filters.search || undefined,
          category: filters.category || undefined,
          city: filters.city || undefined,
          priceMin: filters.priceMin ? parseInt(filters.priceMin) : undefined,
          priceMax: filters.priceMax ? parseInt(filters.priceMax) : undefined,
          capacity: filters.capacity ? parseInt(filters.capacity) : undefined,
        });

        let data = response.data;

        // Sort listings
        if (sortBy === 'price-low') {
          data.sort((a, b) => a.startingPrice - b.startingPrice);
        } else if (sortBy === 'price-high') {
          data.sort((a, b) => b.startingPrice - a.startingPrice);
        } else if (sortBy === 'rating') {
          data.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'newest') {
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      priceMin: '',
      priceMax: '',
      capacity: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
          <p className="text-gray-600 mt-2">
            Find {listings.length} venue
            {listings.length !== 1 ? 's' : ''} and services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 sticky top-20 h-fit">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-green-900 rounded-lg mb-4 w-full justify-center"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>

            {/* Filters */}
            <div
              className={`${
                showFilters ? 'block' : 'hidden'
              } lg:block bg-emerald-700 rounded-lg shadow-md p-6 space-y-6`}
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Venue, catering..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="venue">Event Venues</option>
                  <option value="catering">Catering</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="other">Other Services</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Nairobi, Mombasa..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range (KSh)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Capacity
                </label>
                <input
                  type="number"
                  placeholder="Number of guests"
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {listings.length} listing
                {listings.length !== 1 ? 's' : ''}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {loading ? (
              <LoadingSpinner fullPage text="Loading listings..." />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                message="No listings found"
                description="Try adjusting your filters to find what you're looking for"
                icon="search"
                action={{
                  label: 'Clear filters',
                  onClick: handleClearFilters,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <Package size={48} className="text-gray-400" />
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                            {listing.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {listing.title}
                        </h3>

                        <div className="mb-3">
                          <LocationBadge city={listing.location.city} size="sm" />
                        </div>

                        <div className="mb-4">
                          <RatingStars
                            rating={listing.rating}
                            count={listing.reviewCount}
                          />
                        </div>

                        {listing.capacity && (
                          <div className="mb-4 text-sm text-gray-600">
                            Capacity: up to {listing.capacity} guests
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <PriceDisplay
                            price={listing.startingPrice}
                            period="starting"
                            size="md"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}