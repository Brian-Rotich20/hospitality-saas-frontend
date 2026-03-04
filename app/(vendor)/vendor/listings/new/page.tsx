'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { listingsService, uploadService } from '../../../../lib/api/endpoints';
import { ListingForm } from '../../../../components/vendor/ListingForm';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const response = await uploadService.uploadImage(file);
      const url = response.data?.url;

      if (!url) {
        console.error('Upload response was:', JSON.stringify(response.data, null, 2));
        throw new Error('Upload failed: no URL in response');
      }

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate
      if (!formData.title?.trim())          throw new Error('Title is required');
      if (!formData.description?.trim())    throw new Error('Description is required');
      if (!formData.category)               throw new Error('Category is required');
      if (!formData.address?.trim())        throw new Error('Address is required');
      if (!formData.city?.trim())           throw new Error('City is required');
      if (!formData.capacity || formData.capacity < 1)
                                            throw new Error('Capacity must be at least 1');
      if (!formData.startingPrice || formData.startingPrice <= 0)
                                            throw new Error('Starting price must be greater than 0');
      if (!formData.newImages || formData.newImages.length === 0)
                                            throw new Error('At least one image is required');

      // Upload images
      setSuccess('Uploading images...');
      const imageUrls = await uploadImages(formData.newImages);

      setSuccess('Creating listing...');

      // ✅ submitData matches backend schema exactly
      const submitData = {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        category:    formData.category,
        location:    formData.city.trim(),          // required string field
        address:     formData.address.trim(),       // required, min 10 chars
        city:        formData.city.trim(),
        capacity:    parseInt(formData.capacity),
        basePrice:   parseFloat(formData.startingPrice),
        amenities:   formData.amenities || [],
        photos:      imageUrls,                     // ✅ "photos" not "images"
      };

      console.log('Submitting:', JSON.stringify(submitData, null, 2));

      const response = await listingsService.create(submitData);

      // Backend returns: { success: true, data: { id, ... } }
      const listingId = response.data?.id;

      if (!listingId) {
        console.error('Response:', JSON.stringify(response.data, null, 2));
        throw new Error('Failed to get listing ID from response');
      }

      setSuccess('✅ Listing created successfully! Redirecting...');
      setLoading(false);

      setTimeout(() => {
        router.push(`/my-listings/${listingId}`); // ✅ correct path
      }, 1000);

    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create listing';

      console.error('Error:', backendMsg);
      console.log('Full error response:', JSON.stringify(err?.response?.data, null, 2));
      setError(backendMsg);
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;
  if (!isAuthenticated || user?.role !== 'vendor') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-gray-900">Create New Listing</h1>
          <p className="mt-2 text-gray-600">
            Add your venue, service, or accommodation to reach more customers
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Progress</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <ListingForm
            onSubmit={handleSubmit}
            loading={loading}
            isEditing={false}
          />
        </div>

      </div>
    </div>
  );
}