'use client';

// components/store/StoreContent.tsx
// All useSearchParams / useState logic lives here, safely inside <Suspense>

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing, ListingFilters } from '../../lib/types/listing';
import { ListingCard } from '../listings/ListingCard';
import { ListingsToolbar } from '../listings/ListingsToolbar';
import { Search, SlidersHorizontal } from 'lucide-react';

type SortBy = 'price' | 'rating' | 'createdAt';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      border: '1px solid #F3F4F6', fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEB 50%,#F3F4F6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, borderRadius: 6, background: '#F3F4F6', width: '75%', animation: 'shimmer 1.4s infinite' }} />
        <div style={{ height: 11, borderRadius: 6, background: '#F3F4F6', width: '50%', animation: 'shimmer 1.4s 0.1s infinite' }} />
        <div style={{ height: 11, borderRadius: 6, background: '#F3F4F6', width: '35%', animation: 'shimmer 1.4s 0.2s infinite' }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function StoreContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [sortBy,   setSortBy]   = useState<SortBy>('rating');

  const [filters, setFilters] = useState<ListingFilters>({
    search:      searchParams.get('search')   || undefined,
    category:    (searchParams.get('category') as ListingFilters['category']) || undefined,
    location:    searchParams.get('location') || undefined,
    // note: your original had maxPrice ← priceMin and minPrice ← priceMax
    // keeping the same mapping — adjust if backend differs
    maxPrice:    searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    minPrice:    searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    minCapacity: searchParams.get('capacity') ? Number(searchParams.get('capacity'))  : undefined,
    offset: 1,
    limit:  20,
  });

  const hasActiveFilters = !!(
    filters.search   || filters.category || filters.location ||
    filters.maxPrice || filters.minPrice || filters.minCapacity
  );

  // Sync URL → filters when params change (e.g. from Hero search)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search:   searchParams.get('search')   || undefined,
      category: (searchParams.get('category') as ListingFilters['category']) || undefined,
      location: searchParams.get('location') || undefined,
    }));
  }, [searchParams]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await listingsService.getAll({ ...filters, sortBy });
      // handle both { data: [...] } and { data: { data: [...] } }
      const data: Listing[] = Array.isArray(res.data)
        ? res.data
        : (res.data as any)?.data ?? [];
      setListings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilterChange = (key: keyof ListingFilters, value: string | number) =>
    setFilters(prev => ({ ...prev, [key]: value === '' ? undefined : value, offset: 1 }));

  const handleClearFilters = () => {
    setFilters({ offset: 1, limit: 20 });
    router.push('/store'); // also clear URL params
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .store-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .store-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .store-grid, .skeleton-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Toolbar */}
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

      {/* Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 64px' }}>

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : error ? (
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{error}</p>
            <button
              onClick={fetchListings}
              style={{ padding: '9px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Retry
            </button>
          </div>

        ) : listings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '72px 20px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={22} color="#9CA3AF" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No listings found</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>
              {hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'No listings are available right now.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{ padding: '9px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Clear Filters
              </button>
            )}
          </div>

        ) : (
          <>
            {/* Results count */}
            <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginBottom: 18, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
              {listings.length} result{listings.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' — filters applied' : ''}
            </p>
            <div className="store-grid">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}