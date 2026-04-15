import React from 'react';
import Link  from 'next/link';
import Image from 'next/image';
import { MapPin, Package } from 'lucide-react';
import type { Listing }    from '../../lib/types/listing';
import { resolveListingPrice } from '../../lib/types/listing';

export function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.photos?.[0] ?? listing.coverPhoto;
  const area     = listing.location?.area;
  const county   = listing.location?.county;
  const price    = resolveListingPrice(listing);

  const priceSuffix: Record<string, string> = {
    per_hour:   '/ hr',
    per_day:    '/ day',
    per_person: '/ person',
    package:    'pkg',
    contact:    '',
  };

  const priceLabel: Record<string, string> = {
    package: 'From',
    contact: 'Contact',
  };

  // REPLACE the whole ListingCard return
  return (
    <Link
      href={`/store/${listing.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
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
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1
          group-hover:text-[#2D3B45] transition-colors">
          {listing.title}
        </h3>

        {/* Short description */}
        {listing.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Location — area + county */}
        {(area || county) && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
            <MapPin size={10} className="text-gray-300 shrink-0" />
            {[area, county].filter(Boolean).join(', ')}
          </span>
        )}

        {/* Price */}
        <div className="pt-2 mt-1 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              {priceLabel[listing.pricingType] ?? 'Price'}
            </p>
            {listing.pricingType === 'contact' ? (
              <p className="text-sm font-black text-[#2D3B45]">On request</p>
            ) : (
              <p className="text-sm font-black text-[#2D3B45] leading-none">
                <span className="text-xs font-semibold text-gray-400 mr-0.5">KSh</span>
                {price.toLocaleString()}
                {priceSuffix[listing.pricingType] && (
                  <span className="text-[10px] font-medium text-gray-400 ml-0.5">
                    {priceSuffix[listing.pricingType]}
                  </span>
                )}
              </p>
            )}
          </div>

          {listing.vendor?.verified && (
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50
              px-1.5 py-0.5 rounded-full uppercase tracking-wide border border-emerald-100">
              Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}