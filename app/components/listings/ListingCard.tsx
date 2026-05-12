import React from 'react';
import Link  from 'next/link';
import Image from 'next/image';
import { MapPin, Package, Star } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';
import { resolveListingPrice } from '../../lib/types/listing';

export function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl    = listing.photos?.[0] ?? listing.coverPhoto;
  const area        = listing.location?.area;
  const county      = listing.location?.county;
  const price       = resolveListingPrice(listing);
  const rating      = (listing as any).rating;
  const reviewCount = (listing as any).review_count ?? (listing as any).reviewCount ?? 0;

  const priceSuffix: Record<string, string> = {
    per_hour: '/ hr', per_day: '/ day', per_person: '/ person', package: 'pkg', contact: '',
  };
  const priceLabel: Record<string, string> = { package: 'From', contact: 'Contact' };

  return (
    <Link href={`/store/${listing.id}`}
      className="card card-hover block overflow-hidden no-underline group">

      {/* Image */}
      <div className="relative h-44 overflow-hidden"
        style={{ backgroundColor: '#F0EDE6' }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={listing.title} fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23EDE9E1' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} style={{ color: 'var(--color-border)' }} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-1.5">

        <h3 className="text-sm font-bold leading-snug line-clamp-1 transition-colors
          group-hover:text-[var(--color-brand)]"
          style={{ color: 'var(--color-text-primary)' }}>
          {listing.title}
        </h3>

        {listing.description && (
          <p className="text-[11px] leading-relaxed line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}>
            {listing.description}
          </p>
        )}

        {(area || county) && (
          <span className="flex items-center gap-1 text-[11px] truncate"
            style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={10} style={{ color: 'var(--color-border)', flexShrink: 0 }} />
            {[area, county].filter(Boolean).join(', ')}
          </span>
        )}

        {/* Price + Rating */}
        <div className="pt-2 mt-1 flex items-end justify-between"
          style={{ borderTop: '1px solid var(--color-border)' }}>
          <div>
            <p className="price-label">
              {priceLabel[listing.pricingType] ?? 'Price'}
            </p>
            {listing.pricingType === 'contact' ? (
              <p className="text-sm font-black" style={{ color: 'var(--color-brand)' }}>
                On request
              </p>
            ) : (
              <p className="flex items-baseline gap-0.5 leading-none">
                <span className="price-currency">KSh</span>
                <span className="price-amount" style={{ fontSize: '15px' }}>
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
                <Star size={11}
                  style={{ color: 'var(--color-star)', fill: 'var(--color-star)' }} />
                <span className="text-[11px] font-black"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {Number(rating).toFixed(1)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  ({reviewCount})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Star size={11} style={{ color: 'var(--color-border)', fill: 'var(--color-border)' }} />
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>New</span>
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