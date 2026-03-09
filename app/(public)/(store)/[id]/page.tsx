'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../../../lib/types';
import { MapPin, Users, Check, ArrowLeft, Phone, Calendar, Shield, Star, Package, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [imgIdx,  setImgIdx]  = useState(0);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res      = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
        const response = await res.json();
        setListing(response.data);
      } catch {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2D3B45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Listing not found</p>
          <p className="text-xs text-gray-400 mb-5">{error ?? 'This listing may have been removed.'}</p>
          <Link href="/store"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#2D3B45] px-4 py-2 rounded-xl no-underline hover:bg-[#3a4d5a] transition-colors">
            <ArrowLeft size={13} /> Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const photos    = listing.photos ?? [];
  const amenities = listing.amenities ?? [];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ── Image gallery ── */}
      {photos.length > 0 ? (
        <div className="bg-[#2D3B45]">
          {/* Main image */}
          <div className="relative w-full h-56 sm:h-72 md:h-96">
            <Image
              src={photos[imgIdx]}
              alt={listing.title}
              fill
              className="object-cover opacity-90"
              sizes="100vw"
              priority
            />
            {/* Photo count pill */}
            {photos.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {imgIdx + 1} / {photos.length}
              </span>
            )}
          </div>
          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-2 hide-scrollbar">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all
                    ${i === imgIdx ? 'border-[#F5C842]' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                  <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <Package size={32} className="text-gray-300" />
        </div>
      )}

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Back link */}
        <Link href="/store"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors no-underline mb-5">
          <ArrowLeft size={13} /> Back to listings
        </Link>

        {/* ── Grid: main + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* ── LEFT ── */}
          <div className="space-y-5 min-w-0">

            {/* Title block */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
                {listing.category.replace('_', ' ')}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-3">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {listing.rating != null && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {listing.rating.toFixed(1)}
                    {listing.reviewCount != null && (
                      <span className="text-gray-400 font-normal">({listing.reviewCount} reviews)</span>
                    )}
                  </span>
                )}
                {listing.city && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} className="text-gray-400" />
                    {[listing.address, listing.city].filter(Boolean).join(', ')}
                  </span>
                )}

              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">About</p>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Capacity */}
            {listing.capacity && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Capacity</p>
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                  <Users size={15} className="text-[#2D3B45]" />
                  <span className="text-sm font-bold text-gray-800">
                    Up to {Number(listing.capacity).toLocaleString()} guests
                  </span>
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                      <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span className="text-xs font-medium text-gray-700 truncate">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
              <div className="bg-gray-50 border border-gray-100 rounded-xl h-36 flex flex-col items-center justify-center gap-2">
                <div className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                  <MapPin size={16} className="text-[#2D3B45]" />
                </div>
                <p className="text-xs font-semibold text-gray-600 text-center px-4">
                  {[listing.address, listing.city, listing.county].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-3">

            {/* Booking card — sticky on desktop, normal flow on mobile */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:sticky lg:top-20">

              {/* Price */}
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting from</p>
                <p className="text-2xl font-black text-[#2D3B45] leading-none">
                  <span className="text-sm font-semibold text-gray-400 mr-1">KSh</span>
                  {(listing.basePrice ?? 0).toLocaleString()}
                  <span className="text-xs font-medium text-gray-400 ml-1">/ event</span>
                </p>
              </div>

              <div className="h-px bg-gray-100 mb-4" />

              {/* Quick stats */}
              <div className="space-y-2.5 mb-4">
                {listing.capacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Capacity</span>
                    <span className="text-xs font-bold text-gray-800">{Number(listing.capacity).toLocaleString()} guests</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Rating</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-800">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {listing.rating?.toFixed(1) ?? 'No ratings'}
                    {listing.reviewCount != null && (
                      <span className="text-gray-400 font-normal">({listing.reviewCount})</span>
                    )}
                  </span>
                </div>
                {listing.city && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Location</span>
                    <span className="text-xs font-bold text-gray-800">{listing.city}</span>
                  </div>
                )}
                {listing.currency && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Currency</span>
                    <span className="text-xs font-bold text-gray-800">{listing.currency}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 mb-4" />

              {/* CTAs */}
              <div className="space-y-2">
                <Link href={`/store/${listing.id}/book`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3B45] text-white
                    text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors no-underline">
                  <Calendar size={14} /> Request Booking
                </Link>
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200
                  text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  <Phone size={14} className="text-gray-400" /> Contact Vendor
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <Shield size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Secure booking</strong> · M-Pesa Daraja protected payments
              </p>
            </div>
          </div>
        </div>

        {/* ── Similar listings ── */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-gray-800">Similar Listings</h2>
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Coming soon
            </span>
          </div>
          <p className="text-xs text-gray-400">More venues and services will appear here.</p>
        </div>
      </div>
    </div>
  );
}