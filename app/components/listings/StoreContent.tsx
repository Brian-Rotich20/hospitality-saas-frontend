'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { listingsService } from '../../lib/api/endpoints';
import { Listing, ListingFilters } from '../../lib/types';
import { ListingCard } from '../../components/listings/ListingCard';
import { ListingsToolbar } from '../../components/listings/ListingsToolbar';
import { Package, RefreshCw } from 'lucide-react';

type SortBy = 'price' | 'rating' | 'createdAt';

const SKELETON_COUNT = 8;

function ListingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3.5 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        <div className="pt-2 border-t border-gray-50 flex justify-between items-end">
          <div className="h-5 bg-gray-100 rounded w-20" />
          <div className="h-6 bg-gray-100 rounded-xl w-14" />
        </div>
      </div>
    </div>
  );
}

function Store() {
  const searchParams = useSearchParams();

  const [listings,  setListings]  = useState<Listing[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [sortBy,    setSortBy]    = useState<SortBy>('rating');
  const [filters,   setFilters]   = useState<ListingFilters>({
    search:      searchParams.get('search')   ?? undefined,
    category:    (searchParams.get('category') as ListingFilters['category']) ?? undefined,
    location:    searchParams.get('location') ?? undefined,
  });

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingsService.getAll({ ...filters, sortBy });
      const data = (res as any).data;
      const list: Listing[] = Array.isArray(data) ? data : (data?.data ?? data?.listings ?? []);
      setListings(list);
    } catch (err) {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilterChange = useCallback((key: keyof ListingFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <p className="text-xs text-red-600 font-medium">{error}</p>
            <button onClick={fetchListings}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ListingSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">No listings found</p>
            <p className="text-xs text-gray-400 mb-5">
              {hasActiveFilters
                ? 'Try adjusting or clearing your filters'
                : 'No listings are available right now'}
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters}
                className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Load more placeholder */}
            {listings.length >= 20 && (
              <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-bold
                  text-gray-600 hover:border-[#2D3B45] hover:text-[#2D3B45] transition-colors bg-white">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function StoreConte() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      </div>
    }>
      <Store/>
    </Suspense>
  );
}