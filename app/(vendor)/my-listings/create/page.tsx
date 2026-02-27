'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { listingsService } from '../../../lib/api/endpoints';
export default function CreateListingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || '');
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Handle image uploads
      const imageUrls = await uploadImages(formData.newImages);
      
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          address: formData.address,
          city: formData.city,
        },
        capacity: formData.capacity,
        startingPrice: formData.startingPrice,
        amenities: formData.amenities,
        images: [...formData.images, ...imageUrls],
        status: 'draft',
      };

      const response = await listingsService.create(submitData);
      router.push(`/vendor/my-listings/${response.data.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  async function uploadImages(files: File[]) {
    // Upload to Cloudinary
    const uploadedUrls = await Promise.all(
      files.map(file => uploadToCloudinary(file, 'listings'))
    );
    return uploadedUrls;
  }

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="mt-2 text-gray-600">
            Add your venue, service, or accommodation to reach more customers
          </p>
        </div>
      </div>
    </div>
  );
}