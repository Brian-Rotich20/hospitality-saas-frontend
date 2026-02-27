"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { listingsService } from '../../../lib/api/endpoints';
import { Listing } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ListingGallery } from '../../../components/listings/ListingGallery';
import { Edit, Trash2, Eye, Pause, Play, Calendar } from 'lucide-react';

export default function VendorListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsService.getById(id);
      setListing(response.data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setDeleting(true);
    try {
      await listingsService.deleteById(id);
      router.push('/my-listings');
    } catch (err) {
      setError('Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!listing) return;

    const newStatus = listing.status === 'published' ? 'paused' : 'published';

    try {
      await listingsService.updateStatus(id, newStatus);
      setListing({ ...listing, status: newStatus });
    } catch (err) {
      setError('Failed to update listing status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <p className="text-red-600 mb-4">
            {error || 'Listing not found'}
          </p>
          <Link href="/my-listings" className="text-blue-600 hover:underline">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gallery */}
      {images.length > 0 && <ListingGallery images={images} />}

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main */}
          <div className="col-span-2">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">
                    {listing.category}
                  </p>
                  <h1 className="text-3xl font-bold">
                    {listing.title}
                  </h1>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold ${
                  listing.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status === 'published' ? '🟢 Published' : '⏸ Draft'}
                </div>
              </div>

              <p className="text-gray-700">
                {listing.description}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="font-semibold">
                    {listing.location?.city}, {listing.location?.address}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Capacity</p>
                  <p className="font-semibold">
                    {listing.capacity} guests
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Starting Price</p>
                  <p className="font-semibold">
                    KSh {listing.startingPrice?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Rating</p>
                  <p className="font-semibold">
                    {listing.rating ? listing.rating.toFixed(1) : 'No ratings'}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-3">Amenities</h3>
                <ul className="space-y-2">
                  {listing.amenities.map((amenity: string) => (
                    <li key={amenity}>
                      ✓ {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/my-listings/${id}/edit`}
                  className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition text-center block"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Listing
                </Link>

                <button
                  onClick={handleToggleStatus}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                    listing.status === 'published'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {listing.status === 'published' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Listing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Publish Listing</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/my-listings/${id}/availability`}
                  className="w-full py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-center block"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Availability
                </Link>

                <Link
                  href={`/listings/${id}`}
                  target="_blank"
                  className="w-full py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-center block"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  View Public
                </Link>

                <button
                  onClick={handleDelete}
                  className="w-full py-3 rounded-lg font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{(deleting) ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p>
                  💡 Tip: Publish your listing to make it visible to customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
                
              
            
          
        
      
    
  );
}