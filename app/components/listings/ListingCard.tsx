import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../../lib/types';
import { MapPin, Star, Users, ArrowRight, Package } from 'lucide-react';
import styles from './ListingCard.module.css';

interface ListingCardProps { listing: Listing; }

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images?.[0];

  return (
    <Link href={`/${listing.id}`} className={styles.card}>
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
          <div className={styles.cardPlaceholder}><Package size={36} /></div>
        )}
        <span className={styles.cardBadge}>{listing.category}</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{listing.title}</h3>

        {listing.location?.city && (
          <div className={styles.cardMeta}>
            <MapPin size={12} color="#1d9bf0" />
            {listing.location.city}
          </div>
        )}

        {listing.rating != null && (
          <div className={styles.cardMeta}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <strong style={{ color: '#0f172a', fontSize: 13 }}>{listing.rating.toFixed(1)}</strong>
            {listing.reviewCount != null && (
              <span style={{ color: '#94a3b8', fontSize: 12 }}>
                ({listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        )}

        {listing.capacity != null && (
          <div className={styles.cardCapacity}>
            <Users size={11} color="#94a3b8" />
            Up to {Number(listing.capacity).toLocaleString()} guests
          </div>
        )}

        <div className={styles.cardDivider} />

        <div className={styles.cardFooter}>
          <div>
            <div className={styles.priceLabel}>Starting from</div>
            <div className={styles.priceValue}>
              <span className={styles.priceCurrency}>KSh</span>
              {(listing.startingPrice ?? 0).toLocaleString()}
              <span className={styles.pricePeriod}>/event</span>
            </div>
          </div>
          <div className={styles.cardArrow}><ArrowRight size={14} /></div>
        </div>
      </div>
    </Link>
  );
}