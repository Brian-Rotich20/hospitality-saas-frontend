'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { LocationBadge } from '../../../components/common/LocationBadge';
import { RatingStars } from '../../../components/common/RatingStars';
import { AvailabilityBadge } from '../../../components/common/AvailabilityBadge';
import { ListingGallery } from '../../../components/listings/ListingGallery';
import { MapPin, Users, Check, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        const response = await res.json();
        setListing(response.data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage text="Loading listing..." />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Listing not found'}
          </h1>
          <Link
            href="/listings"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft size={20} />
            <span>Back to listings</span>
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Gallery Section - Using Component */}
      {images.length > 0 && <ListingGallery images={images} />}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Link
              href="/listings"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <ArrowLeft size={20} />
              <span>Back to listings</span>
            </Link>

            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize mb-3">
                    {listing.category}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {listing.title}
                  </h1>
                </div>
              </div>

              {/* Rating and Location */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                <RatingStars
                  rating={listing.rating}
                  count={listing.reviewCount}
                />
                <LocationBadge
                  city={listing.location.city}
                  area={listing.location.address}
                  size="md"
                />
                {listing.availability && (
                  <AvailabilityBadge
                    available={listing.availability.available}
                    size="md"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>

              {listing.capacity && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                  <Users size={24} className="text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-semibold text-gray-900">
                      Up to {listing.capacity.toLocaleString()} guests
                    </p>
                  </div>
                </div>
              )}

              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <Check size={20} className="text-green-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {listing.location.address}, {listing.location.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 sticky top-24 space-y-6">
              {/* Price */}
              <div>
                <p className="text-gray-600 text-sm mb-2">Starting from</p>
                <PriceDisplay
                  price={listing.startingPrice}
                  period="per event"
                  size="lg"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Quick Info */}
              <div className="space-y-3">
                {listing.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.capacity.toLocaleString()} guests
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-gray-900">
                    {listing.rating ? listing.rating.toFixed(1) : 'N/A'} / 5.0
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/listings/${listing.id}/book`}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center block"
                >
                  Request Booking
                </Link>
                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition">
                  Contact Vendor
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Need help?</strong> Our support team is available 24/7 to assist you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Listings Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Similar Listings
          </h2>
          <p className="text-gray-600">
            More listings coming soon. Check back later for similar venues and services.
          </p>
        </div>
      </div>
    </div>
  );
}