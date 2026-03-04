'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing, ListingFilters } from '../../lib/types/listing';
import { ListingCard } from '../../components/listings/ListingCard';
import { ListingsToolbar } from '../../components/listings/ListingsToolbar';
import { Search } from 'lucide-react';
import styles from '../../components/listings/ListingCard.module.css';

type SortBy = 'price' | 'rating' | 'createdAt';

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeleton} ${styles.skeletonImg}`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonLg}`} />
        <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonShort}`} />
        <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonShorter}`} />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [sortBy, setSortBy]       = useState<SortBy>('rating');

  const [filters, setFilters] = useState<ListingFilters>({
    search:   searchParams.get('search')   || undefined,
    category: (searchParams.get('category') as ListingFilters['category']) || undefined,
    location: searchParams.get('location') || undefined,
    maxPrice: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    minPrice: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    minCapacity: searchParams.get('capacity') ? Number(searchParams.get('capacity')) : undefined,
    offset: 1,
    limit: 20,
  });

  const hasActiveFilters = !!(
    filters.search   ||
    filters.category ||
    filters.location ||
    filters.maxPrice ||
    filters.minPrice ||
    filters.minCapacity
  );

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listingsService.getAll(filters, sortBy);
        setListings(response.data as unknown as Listing[]);
      } catch (err) {
        console.error(err);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filters, sortBy]);

  const handleFilterChange = (key: keyof ListingFilters, value: string | number) =>
    setFilters(prev => ({ ...prev, [key]: value === '' ? undefined : value }));

  const handleClearFilters = () =>
    setFilters({ offset: 1, limit: 20 });

  return (
    <div className={styles.root}>
      {/* Toolbar — outside the layout grid, full width */}
      <ListingsToolbar
        count={listings.length}
        loading={loading}
        filters={filters}
        sortBy={sortBy}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onSortChange={setSortBy}
      />

      {/* Main grid */}
      <main className="max-w-[1280px] mx-auto px-6 py-7">
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : listings.length === 0 ? (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}><Search size={24} /></div>
            <h3 className={styles.emptyTitle}>No listings found</h3>
            <p className={styles.emptyDesc}>Try adjusting your filters to see more results.</p>
            <button className={styles.emptyBtn} onClick={handleClearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </main>
    </div>
  );
}