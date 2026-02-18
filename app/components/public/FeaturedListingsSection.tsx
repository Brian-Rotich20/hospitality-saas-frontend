'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listingsService } from '../../lib/api/endpoints';
import { Listing } from '../../lib/types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { LocationBadge } from '../../components/common/LocationBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { Package } from 'lucide-react';

export function FeaturedListingsSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await listingsService.getFeatured();
        setListings(response.data.slice(0, 6)); // Show 6 featured listings
      } catch (err) {
        console.error('Error fetching featured listings:', err);
        setError('Failed to load featured listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner fullPage text="Loading featured listings..." />
        </div>
      </section>
    );
  }

  if (error || listings.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
          </div>
          <EmptyState
            message="No featured listings available"
            description="Check back soon for amazing venues and services"
            icon="package"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Featured Listings
            </h2>
            <p className="text-gray-600">
              Our most popular venues and services
            </p>
          </div>
          <Link
            href="/listings"
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-2 md:flex"
          >
            <span>View all</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Location */}
                  <div className="mb-3">
                    <LocationBadge city={listing.location.city} size="sm" />
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <RatingStars
                      rating={listing.rating}
                      count={listing.reviewCount}
                    />
                  </div>

                  {/* Amenities preview */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {listing.amenities.slice(0, 2).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {listing.amenities.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{listing.amenities.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price - Always at bottom */}
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

        {/* View All Button - Mobile */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/listings"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
}