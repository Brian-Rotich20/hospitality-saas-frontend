'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/auth/auth.context';
import { useRouter, useParams } from 'next/navigation';
import { listingsService } from '../../../../lib/api/endpoints';
import { Listing } from '../../../../lib/types';
import { ListingForm } from '../../../../components/vendor/ListingForm';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditListingPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    if (!authLoading && isAuthenticated && id) {
      fetchListing();
    }
  }, [id, isAuthenticated, authLoading, user, router]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsService.getById(id);
      setListing(response.data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing. Redirecting...');
      setTimeout(() => {
        router.push('/vendor/my-listings');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (
    file: File,
    folder: string
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || ''
      );
      formData.append('folder', `venuehub/${folder}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error('No URL returned from Cloudinary');
      }

      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw new Error(
        err instanceof Error ? err.message : 'Failed to upload image'
      );
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadToCloudinary(file, 'listings'))
      );
      return uploadedUrls;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to upload images'
      );
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSaveLoading(true);
      setError(null);
      setSuccess(null);

      // Validate form data
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description?.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.address?.trim()) {
        throw new Error('Address is required');
      }
      if (!formData.city?.trim()) {
        throw new Error('City is required');
      }
      if (!formData.capacity || formData.capacity < 1) {
        throw new Error('Capacity must be at least 1');
      }
      if (!formData.startingPrice || formData.startingPrice <= 0) {
        throw new Error('Starting price must be greater than 0');
      }

      setSuccess('Uploading images...');

      // Handle new image uploads
      let newImageUrls: string[] = [];
      if (formData.newImages && formData.newImages.length > 0) {
        newImageUrls = await uploadImages(formData.newImages);
      }

      // Combine existing and new images
      const allImages = [...(formData.images || []), ...newImageUrls];

      if (allImages.length === 0) {
        throw new Error('At least one image is required');
      }

      setSuccess('Updating listing...');

      // Prepare submission data
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
        },
        capacity: parseInt(formData.capacity),
        startingPrice: parseFloat(formData.startingPrice),
        amenities: formData.amenities || [],
        images: allImages,
      };

      // Update listing
      const response = await listingsService.update(id, submitData);

      if (!response.data?.id) {
        throw new Error('Failed to update listing');
      }

      setSuccess(`✅ Listing updated successfully! Redirecting...`);

      // Redirect to listing detail page
      setTimeout(() => {
        router.push(`/my-listings/${id}`);
      }, 1000);
    } catch (err) {
      console.error('Error updating listing:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update listing';
      setError(errorMessage);
      setSaveLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage text="Loading listing..." />;
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Listing not found
          </h1>
          <p className="text-gray-600 mb-6">
            The listing you're trying to edit doesn't exist or has been deleted
          </p>
          <Link
            href="/my-listings"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href={`/my-listings/${id}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
        >
          <ArrowLeft size={20} />
          <span>Back to Listing</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Edit Listing</h1>
          <p className="mt-2 text-gray-600">
            Update your listing details to keep information current
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <ListingForm
            initialData={listing}
            onSubmit={handleSubmit}
            loading={saveLoading}
            isEditing={true}
          />
        </div>
      </div>
    </div>
  );
}