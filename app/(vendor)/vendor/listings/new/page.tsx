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
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!authLoading && user?.role !== 'vendor') { router.push('/dashboard'); }
  }, [isAuthenticated, authLoading, user, router]);

  // Upload via backend proxy → Cloudinary
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const res = await uploadService.uploadImage(file);
      const url = res.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true); setError(null); setSuccess(null);

      // Client-side guards (form also validates, but double-check)
      if (!formData.newImages?.length) throw new Error('At least one image is required');

      setSuccess('Uploading photos...');
      const photoUrls = await uploadImages(formData.newImages);

      setSuccess('Creating listing...');

      // ✅ Payload matches backend createListingSchema exactly
      const payload = {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        category:    formData.category,
        location:    formData.city.trim(),      // required string
        address:     formData.address.trim(),   // min 10 chars
        city:        formData.city.trim(),
        capacity:    parseInt(formData.capacity, 10),
        basePrice:   parseFloat(formData.startingPrice),
        amenities:   formData.amenities ?? [],
        photos:      photoUrls,                 // ✅ "photos" not "images"
      };

      const response = await listingsService.create(payload);
      // apiClient unwraps one level → response.data = backend's data object
      const listingId = response.data?.id;

      if (!listingId) throw new Error('No listing ID in response');

      setSuccess('✅ Listing created! Redirecting...');
      setLoading(false);
      setTimeout(() => router.push(`/vendor/listings/${listingId}`), 1000);

    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to create listing';
      setError(msg);
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;
  if (!isAuthenticated || user?.role !== 'vendor') return null;

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Create New Listing
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Add your venue, service, or accommodation to reach more customers
        </p>
      </div>

      {success && (
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991B1B', fontWeight: 600 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} loading={loading} isEditing={false} />
    </div>
  );
}