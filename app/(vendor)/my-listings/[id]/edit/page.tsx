'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/auth/auth.context';
import { useRouter, useParams } from 'next/navigation';
import { listingsService } from '../../../../lib/api/endpoints';
import { ListingForm } from '../../../../components/vendor/ListingForm';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

export default function EditListingPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchListing();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchListing = async () => {
    try {
      const response = await listingsService.getById(id);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      router.push('/vendor/my-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Handle new image uploads
      const newImageUrls = await uploadImages(formData.newImages);
      
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
        images: [...formData.images, ...newImageUrls],
      };

      await listingsService.update(id, submitData);
      router.push(`/vendor/my-listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
    }
  };

  async function uploadImages(files: File[]) {
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'listings');
        const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        return data.secure_url;
      })
    );
    return uploadedUrls;
  }

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <p className="text-gray-600">Update your listing details</p>
      </div>
      <ListingForm listing={listing} onSubmit={handleSubmit} />
    </div>
  );
}