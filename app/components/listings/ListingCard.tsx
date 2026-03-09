import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users, Package } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';
import { resolveListingPrice } from '../../lib/types/listing';

interface ListingCardProps { listing: Listing; }

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.photos?.[0] ?? listing.coverPhoto;
  const city     = listing.location?.city;
  const price    = resolveListingPrice(listing);

  // Pricing label
  const priceSuffix: Record<string, string> = {
    per_day:    '/ day',
    per_hour:   '/ hr',
    per_person: '/ person',
    package:    'package',
  };
  const suffix = priceSuffix[listing.pricingType] ?? '';

  return (
    <Link
      href={`/store/${listing.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package size={24} className="text-gray-300" />
          </div>
        )}
        {/* Category badge */}
        {listing.category && (
          <span className="absolute top-2.5 left-2.5 bg-[#2D3B45]/90 text-white text-[10px]
            font-bold px-2 py-0.5 rounded-full capitalize">
            {listing.category.name}
          </span>
        )}
        {/* Instant booking badge */}
        {listing.instantBooking && (
          <span className="absolute top-2.5 right-2.5 bg-[#F5C842] text-[#2D3B45] text-[9px]
            font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
            Instant
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-[#2D3B45]">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {city && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
              <MapPin size={10} className="text-gray-300 shrink-0" />
              {city}
            </span>
          )}
          {listing.vendor?.verified && (
            <span className="shrink-0 text-[9px] font-black text-emerald-600 bg-emerald-50
              px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Verified
            </span>
          )}
        </div>

        {listing.capacity != null && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Users size={10} className="text-gray-300" />
            Up to {Number(listing.capacity).toLocaleString()} guests
          </span>
        )}

        {/* Price */}
        <div className="pt-2 mt-1 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              {listing.pricingType === 'range' ? 'From' : 'Price'}
            </p>
            <p className="text-sm font-black text-[#2D3B45] leading-none">
              <span className="text-xs font-semibold text-gray-400 mr-0.5">KSh</span>
              {price.toLocaleString()}
              {suffix && <span className="text-[10px] font-medium text-gray-400 ml-0.5">{suffix}</span>}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#2D3B45] bg-[#F5C842] px-2.5 py-1
            rounded-xl group-hover:bg-[#2D3B45] group-hover:text-[#F5C842] transition-colors">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}