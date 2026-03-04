import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../../lib/types';
import { MapPin, Star, Users, ArrowRight, Package } from 'lucide-react';
import styles from './ListingCard.module.css';

interface ListingCardProps { listing: Listing; }

export function ListingCard({ listing }: ListingCardProps) {
  // ✅ photos not images
  const imageUrl = listing.photos?.[0] ?? listing.coverPhoto;

  return (
    <Link href={`/listings/${listing.id}`} className={styles.card}>
      <div className={styles.cardImageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className={styles.cardImage}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className={styles.cardPlaceholder}><Package size={28} /></div>
        )}
        <span className={styles.cardBadge}>{listing.category.replace('_', ' ')}</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{listing.title}</h3>

        {/* ✅ flat city field */}
        {listing.city && (
          <div className={styles.cardMeta}>
            <MapPin size={11} color="#1d9bf0" />
            {listing.city}
          </div>
        )}

        {listing.rating != null && (
          <div className={styles.cardMeta}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <strong style={{ color: '#0f172a', fontSize: 12 }}>{listing.rating.toFixed(1)}</strong>
            {listing.reviewCount != null && (
              <span style={{ color: '#94a3b8', fontSize: 11 }}>
                ({listing.reviewCount})
              </span>
            )}
          </div>
        )}

        {listing.capacity != null && (
          <div className={styles.cardCapacity}>
            <Users size={10} color="#94a3b8" />
            Up to {Number(listing.capacity).toLocaleString()} guests
          </div>
        )}

        <div className={styles.cardDivider} />

        <div className={styles.cardFooter}>
          <div>
            <div className={styles.priceLabel}>From</div>
            <div className={styles.priceValue}>
              <span className={styles.priceCurrency}>KSh</span>
              {/* ✅ basePrice not startingPrice */}
              {(listing.basePrice ?? 0).toLocaleString()}
            </div>
          </div>
          <div className={styles.cardArrow}><ArrowRight size={13} /></div>
        </div>
      </div>
    </Link>
  );
}