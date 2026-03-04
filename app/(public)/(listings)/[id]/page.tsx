'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { LocationBadge } from '../../../components/common/LocationBadge';
import { RatingStars } from '../../../components/common/RatingStars';
import { ListingGallery } from '../../../components/listings/ListingGallery';
import { MapPin, Users, Check, ArrowLeft, Phone, Calendar, Shield } from 'lucide-react';
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

  if (loading) return <LoadingSpinner fullPage text="Loading..." />;

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 16 }}>{error || 'Listing not found'}</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to listings
          </Link>
        </div>
      </div>
    );
  }

  // ✅ photos from backend, no more listing.images
  const images = listing.photos?.length > 0 ? listing.photos : [];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'DM Sans, sans-serif' }}>

      {images.length > 0 && <ListingGallery images={images} />}

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 20px 64px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6B7280', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={13} /> Back to listings
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 40, alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div>
            <div style={{ display: 'inline-block', background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, marginBottom: 10, textTransform: 'uppercase' }}>
              {listing.category.replace('_', ' ')}
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.25, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              {listing.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}>
              {/* ✅ rating is optional, guard it */}
              {listing.rating != null && (
                <RatingStars rating={listing.rating} count={listing.reviewCount} size="sm" />
              )}
              {/* ✅ use flat city/address fields */}
              <LocationBadge city={listing.city} area={listing.address} size="sm" />
              {/* ✅ removed AvailabilityBadge — availability is not on the Listing object */}
            </div>

            <div style={{ height: 1, background: '#E5E7EB', marginBottom: 26 }} />

            <section style={{ marginBottom: 30 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>About</p>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>{listing.description}</p>
            </section>

            <div style={{ height: 1, background: '#E5E7EB', marginBottom: 26 }} />

            {listing.capacity && (
              <section style={{ marginBottom: 30 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Capacity</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px' }}>
                  <Users size={14} color="#6B7280" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                    Up to {listing.capacity.toLocaleString()} guests
                  </span>
                </div>
              </section>
            )}

            {listing.amenities?.length > 0 && (
              <section style={{ marginBottom: 30 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Amenities</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 7 }}>
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                      <Check size={12} color="#111827" strokeWidth={2.5} />
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div style={{ height: 1, background: '#E5E7EB', marginBottom: 26 }} />

            <section>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Location</p>
              <div style={{ background: '#F3F4F6', borderRadius: 10, height: 172, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E7EB', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} color="#1A1A1A" />
                </div>
                {/* ✅ flat address + city */}
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, fontWeight: 500 }}>
                  {listing.address}, {listing.city}
                </p>
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: '22px 20px', marginBottom: 10 }}>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Starting from</p>
                {/* ✅ basePrice not startingPrice */}
                <PriceDisplay price={listing.basePrice} period="per event" size="lg" />
              </div>

              <div style={{ height: 1, background: '#F3F4F6', marginBottom: 14 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                {listing.capacity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Capacity</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{listing.capacity.toLocaleString()} guests</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 13, color: '#EAB308' }}>★</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{listing.rating?.toFixed(1) ?? 'N/A'}</span>
                    {listing.reviewCount != null && <span style={{ fontSize: 11, color: '#9CA3AF' }}>({listing.reviewCount})</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Location</span>
                  {/* ✅ listing.city not listing.location.city */}
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{listing.city}</span>
                </div>
              </div>

              <div style={{ height: 1, background: '#F3F4F6', marginBottom: 14 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  href={`/listings/${listing.id}/book`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', background: '#111827', color: '#FFFFFF', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                >
                  <Calendar size={13} /> Request Booking
                </Link>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 20px', background: '#FFFFFF', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Phone size={13} color="#6B7280" /> Contact Vendor
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 14px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10 }}>
              <Shield size={13} color="#6B7280" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#374151' }}>Secure booking</strong> · M-Pesa Daraja protected payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar listings */}
      <div style={{ borderTop: '1px solid #E5E7EB', background: '#FFFFFF', padding: '36px 20px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Similar Listings</h2>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid #E5E7EB', padding: '2px 7px', borderRadius: 20 }}>Coming soon</span>
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>More venues and services will appear here.</p>
        </div>
      </div>
    </div>
  );
}