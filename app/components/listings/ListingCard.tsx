import React from 'react';
import Link  from 'next/link';
import Image from 'next/image';
import { MapPin, Package, Star } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';
import { resolveListingPrice } from '../../lib/types/listing';;

export function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl    = listing.photos?.[0] ?? listing.coverPhoto;
  const area        = listing.location?.area;
  const county      = listing.location?.county;
  const price       = resolveListingPrice(listing);
  const rating      = listing.rating;
  const reviewCount = listing.reviewCount ?? listing.review_count ?? 0;

  const priceSuffix: Record<string, string> = {
    per_hour: '/ hr', per_day: '/ day', per_person: '/ person', package: 'pkg', contact: '',
  };
  const priceLabel: Record<string, string> = { package: 'From', contact: 'Contact for price' };

  return (
    <Link href={`/store/${listing.id}`}
      className="card card-hover block overflow-hidden no-underline group">

      <div className="relative h-44 overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={listing.title} fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23F6ECE3' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} className="text-border" />
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-1.5">

        <h3 className="text-sm font-bold leading-snug line-clamp-1 text-text-primary
          transition-colors group-hover:text-brand">
          {listing.title}
        </h3>

        {listing.description && (
          <p className="text-[11px] leading-relaxed line-clamp-2 text-text-muted">
            {listing.description}
          </p>
        )}

        {(area || county) && (
          <span className="flex items-center gap-1 text-[11px] truncate text-text-muted">
            <MapPin size={10} className="text-border shrink-0" />
            {[area, county].filter(Boolean).join(', ')}
          </span>
        )}

        <div className="pt-2 mt-1 flex items-end justify-between border-t border-border">
          <div>
            <p className="price-label">
              {priceLabel[listing.pricingType] ?? 'Price'}
            </p>
            
            {listing.pricingType !== 'contact' && price !== null && (
              <p className="flex items-baseline gap-0.5 leading-none">
                <span className="price-currency">KSh</span>
                <span className="price-amount text-[15px]">
                  {price.toLocaleString()}
                </span>
                {priceSuffix[listing.pricingType] && (
                  <span className="price-suffix">{priceSuffix[listing.pricingType]}</span>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {rating ? (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-star fill-star" />
                <span className="text-[11px] font-black text-text-primary">
                  {Number(rating).toFixed(1)}
                </span>
                <span className="text-[10px] text-text-muted">({reviewCount})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-border fill-border" />
                <span className="text-[10px] text-text-muted">New</span>
              </div>
            )}
            {listing.vendor?.verified && (
              <span className="badge badge-success">Verified</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}