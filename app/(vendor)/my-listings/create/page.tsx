'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { listingsService } from '../../../lib/api/endpoints';
import { ListingForm } from '../../../components/vendor/ListingForm';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CreateListingPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && user?.role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, user, router]);

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
      setLoading(true);
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

      // Handle image uploads
      let imageUrls: string[] = [];
      if (formData.newImages && formData.newImages.length > 0) {
        imageUrls = await uploadImages(formData.newImages);
      }

      // Combine existing and new images
      const allImages = [...(formData.images || []), ...imageUrls];

      if (allImages.length === 0) {
        throw new Error('At least one image is required');
      }

      setSuccess('Creating listing...');

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
        status: 'draft',
      };

      // Create listing
      const response = await listingsService.create(submitData);

      if (!response.data?.id) {
        throw new Error('Failed to get listing ID from response');
      }

      setSuccess(`✅ Listing created successfully! Redirecting...`);

      // Redirect to listing detail page
      setTimeout(() => {
        router.push(`/vendor/my-listings/${response.data.id}`);
      }, 1000);
    } catch (err) {
      console.error('Error creating listing:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create listing';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullPage text="Loading..." />;
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Create New Listing</h1>
          <p className="mt-2 text-gray-600">
            Add your venue, service, or accommodation to reach more customers
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
            onSubmit={handleSubmit}
            loading={loading}
            isEditing={false}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Success</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>
              ✓ <strong>Be descriptive:</strong> Write a detailed description about your listing
            </li>
            <li>
              ✓ <strong>Clear images:</strong> Upload high-quality photos that showcase your venue
            </li>
            <li>
              ✓ <strong>Accurate pricing:</strong> Set competitive prices to attract customers
            </li>
            <li>
              ✓ <strong>List amenities:</strong> Tell customers what features are available
            </li>
            <li>
              ✓ <strong>Complete info:</strong> Fill all required fields for better visibility
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}