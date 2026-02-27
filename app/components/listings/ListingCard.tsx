'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../../lib/types';
import { MapPin, Star, Users, ArrowRight, Package } from 'lucide-react';
import styles from './ListingCard.module.css';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images?.[0];

  return (
    <Link href={`/listings/${listing.id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.cardImageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            width={400}
            height={300}
            className={styles.cardImage}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className={styles.cardPlaceholder}>
            <Package size={36} />
          </div>
        )}
        <span className={styles.cardBadge}>{listing.category}</span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{listing.title}</h3>

        {/* Location */}
        <div className={styles.cardMeta}>
          <MapPin size={12} color="#2563aa" />
          {listing.location?.city}
        </div>

        {/* Rating */}
        {listing.rating != null && (
          <div className={styles.cardMeta}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <strong style={{ color: '#1a2332', fontSize: 13 }}>
              {listing.rating.toFixed(1)}
            </strong>
            {listing.reviewCount != null && (
              <span style={{ color: '#9baec8', fontSize: 12 }}>
                ({listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        )}

        {/* Capacity */}
        {listing.capacity != null && (
          <div className={styles.cardCapacity}>
            <Users size={11} color="#5a7192" />
            Up to {Number(listing.capacity).toLocaleString()} guests
          </div>
        )}

        <div className={styles.cardDivider} />

        {/* Footer */}
        <div className={styles.cardFooter}>
          <div>
            <div className={styles.priceLabel}>Starting from</div>
            <div className={styles.priceValue}>
              <span className={styles.priceCurrency}>KSh</span>
              {(listing.startingPrice ?? 0).toLocaleString()}
              <span className={styles.pricePeriod}>/event</span>
            </div>
          </div>
          <div className={styles.cardArrow}>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}