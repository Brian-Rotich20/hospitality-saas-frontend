'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing } from '../../lib/types';
import {
  Search, SlidersHorizontal, Package,
  Users, X, ChevronDown, ArrowUpDown, ArrowRight, MapPin, Star,
} from 'lucide-react';
import styles from './listings.module.css';

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    city:     searchParams.get('city')     || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    capacity: searchParams.get('capacity') || '',
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listingsService.getAll({
          search:   filters.search   || undefined,
          category: filters.category || undefined,
          city:     filters.city     || undefined,
          priceMin: filters.priceMin ? parseInt(filters.priceMin) : undefined,
          priceMax: filters.priceMax ? parseInt(filters.priceMax) : undefined,
          capacity: filters.capacity ? parseInt(filters.capacity) : undefined,
        });
        const data = [...response.data];
        if (sortBy === 'price-low')  data.sort((a, b) => (a.startingPrice ?? 0) - (b.startingPrice ?? 0));
        if (sortBy === 'price-high') data.sort((a, b) => (b.startingPrice ?? 0) - (a.startingPrice ?? 0));
        if (sortBy === 'rating')     data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        if (sortBy === 'newest')     data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setListings(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filters, sortBy]);

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleClearFilters = () =>
    setFilters({ search: '', category: '', city: '', priceMin: '', priceMax: '', capacity: '' });

  return (
    <div className={styles.root}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <p className={styles.pageLabel}>Kenya's Hospitality Marketplace</p>
          <h1 className={styles.pageTitle}>Browse Venues & Services</h1>
          <p className={styles.pageSubtitle}>
            {loading
              ? 'Finding available listings…'
              : `${listings.length} verified listing${listings.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className={styles.layout}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>

          {/* Mobile toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={15} />
            {showFilters ? 'Hide Filters' : 'Filter Results'}
            {hasActiveFilters && <span className={styles.mobileToggleDot} />}
          </button>

          {/* Sidebar card — always visible on desktop, toggled on mobile */}
          <div className={`${styles.sidebarCard} ${showFilters ? styles.sidebarCardOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <span className={styles.sidebarHeadTitle}>
                <SlidersHorizontal size={14} /> Filters
              </span>
              {hasActiveFilters && (
                <button className={styles.sidebarClearBtn} onClick={handleClearFilters}>
                  <X size={11} /> Reset
                </button>
              )}
            </div>

            <div className={styles.sidebarBody}>

              {/* Keyword */}
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Keyword</label>
                <div className={styles.inputWrap}>
                  <Search size={14} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.filterInput}
                    placeholder="Search listings…"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Category</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.filterSelect}
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="venue">Event Venues</option>
                    <option value="catering">Catering</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="other">Other Services</option>
                  </select>
                  <ChevronDown size={13} className={styles.selectChevron} />
                </div>
              </div>

              {/* City */}
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>City</label>
                <input
                  type="text"
                  className={`${styles.filterInput} ${styles.filterInputBare}`}
                  placeholder="e.g. Nairobi"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              {/* Price */}
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Price Range (KSh)</label>
                <div className={styles.priceRow}>
                  <input
                    type="number"
                    className={`${styles.filterInput} ${styles.filterInputBare}`}
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  />
                  <input
                    type="number"
                    className={`${styles.filterInput} ${styles.filterInputBare}`}
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Min. Capacity</label>
                <div className={styles.inputWrap}>
                  <Users size={14} className={styles.inputIcon} />
                  <input
                    type="number"
                    className={styles.filterInput}
                    placeholder="No. of guests"
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button className={styles.clearBtn} onClick={handleClearFilters}>
                  <X size={13} /> Clear All Filters
                </button>
              )}

            </div>
          </div>
        </aside>

        {/* ── Listings ── */}
        <main>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>
              <strong>{loading ? '—' : listings.length}</strong>{' '}
              listing{listings.length !== 1 ? 's' : ''} found
            </p>
            <div className={styles.sortWrap}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ArrowUpDown size={13} className={styles.sortIcon} />
            </div>
          </div>

          {/* States */}
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
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className={styles.card}>

                  {/* Image */}
                  <div className={styles.cardImageWrap}>
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className={styles.cardImage} />
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
                          {(listing.rating).toFixed(1)}
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
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}