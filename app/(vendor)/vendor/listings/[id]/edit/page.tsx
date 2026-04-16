'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../../lib/auth/auth.context';
import { useRouter, useParams } from 'next/navigation';
import { listingsService, uploadService } from '../../../../../lib/api/endpoints';
import { Listing } from '../../../../../lib/types';

import { LoadingSpinner } from '../../../../../components/common/LoadingSpinner';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function EditListingPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [listing,     setListing]     = useState<Listing | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!authLoading && user?.role !== 'vendor') { router.push('/dashboard'); return; }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && id) fetchListing();
  }, [id, authLoading, isAuthenticated]);

  const fetchListing = async () => {
    try {
      setLoading(true); setError(null);
      const res = await listingsService.getById(id);
      // apiClient returns response.data = backend's data object
      const data = (res.data as any)?.data ?? res.data;
      setListing(data);
    } catch {
      setError('Failed to load listing. Redirecting...');
      setTimeout(() => router.push('/vendor/listings'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Upload new files via backend proxy
  const uploadNewPhotos = async (files: File[]): Promise<string[]> => {
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
      setSaveLoading(true); setError(null); setSuccess(null);

      // Upload any new photos
      setSuccess('Uploading new photos...');
      const newUrls = formData.newImages?.length
        ? await uploadNewPhotos(formData.newImages)
        : [];

      // Combine kept existing photos + newly uploaded
      const allPhotos = [...(formData.existingPhotos ?? []), ...newUrls];

      if (allPhotos.length === 0) throw new Error('At least one photo is required');

      setSuccess('Updating listing...');

      // ✅ Payload matches backend updateListingSchema (partial of createListingSchema)
      const payload = {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        category:    formData.category,
        location:    formData.county.trim(),
        address:     formData.address.trim(),
        county:        formData.county.trim(),
        area:          formData.area.trim(),
        capacity:    parseInt(formData.capacity, 10),
        basePrice:   parseFloat(formData.startingPrice),  // ✅ basePrice not startingPrice
        amenities:   formData.amenities ?? [],
        photos:      allPhotos,                           // ✅ photos not images
      };

      const response = await listingsService.update(id, payload);
      const updated  = (response.data as any)?.data ?? response.data;

      if (!updated?.id) throw new Error('Failed to update listing');

      setSuccess('✅ Listing updated! Redirecting...');
      setSaveLoading(false);
      setTimeout(() => router.push(`/vendor/listings/${id}`), 1000);

    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to update listing';
      setError(msg);
      setSaveLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner fullPage text="Loading listing..." />;
  if (!isAuthenticated || user?.role !== 'vendor') return null;

  if (!listing) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
        <AlertCircle size={36} color="#EF4444" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>Listing not found</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>It may have been deleted</p>
        <Link href="/vendor/listings" style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>
          ← Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Back */}
      <Link href={`/vendor/listings/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6B7280', textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={13} /> Back to listing
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Edit Listing</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Update your listing details</p>
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

    </div>
  );
}