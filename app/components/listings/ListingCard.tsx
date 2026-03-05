import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../../lib/types';
import { MapPin, Star, Users, Package } from 'lucide-react';

interface ListingCardProps { listing: Listing; }

const CATEGORY_LABELS: Record<string, string> = {
  event_venue:   'Venue',
  catering:      'Catering',
  accommodation: 'Stay',
  other:         'Service',
};

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.photos?.[0] ?? listing.coverPhoto;
  const label    = CATEGORY_LABELS[listing.category] ?? listing.category;

  return (
    <Link
      href={`/store/${listing.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      {/* Image — fixed compact height */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <span className="absolute top-2.5 left-2.5 bg-[#2D3B45]/90 text-white text-[10px]
          font-bold px-2 py-0.5 rounded-full capitalize">
          {label}
        </span>
        {/* Instant booking pill */}
        {listing.instantBooking && (
          <span className="absolute top-2.5 right-2.5 bg-[#F5C842] text-[#2D3B45] text-[10px]
            font-black px-2 py-0.5 rounded-full">
            Instant
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-[#2D3B45]">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between">
          {/* Location */}
          {listing.city && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
              <MapPin size={10} className="text-gray-300 shrink-0" />
              {listing.city}
            </span>
          )}

          {/* Rating */}
          {listing.rating != null && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0 ml-auto">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <strong className="text-gray-800 text-xs">{listing.rating.toFixed(1)}</strong>
              {listing.reviewCount != null && (
                <span className="text-gray-400">({listing.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        {/* Capacity */}
        {listing.capacity != null && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Users size={10} className="text-gray-300" />
            Up to {Number(listing.capacity).toLocaleString()} guests
          </span>
        )}

        {/* Divider + Price */}
        <div className="pt-2 mt-1 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">From</p>
            <p className="text-sm font-black text-[#2D3B45] leading-none">
              <span className="text-xs font-semibold text-gray-400 mr-0.5">KSh</span>
              {(listing.basePrice ?? 0).toLocaleString()}
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