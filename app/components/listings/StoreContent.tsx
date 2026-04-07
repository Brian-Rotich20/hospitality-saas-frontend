'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { listingsService, productsService } from '../../lib/api/endpoints';
import type { Listing, Product, ListingFilters, ProductFilters } from '../../lib/types/listing';
import { ListingCard } from './ListingCard';
import { ProductCard } from './ProductCard';
import { Package, RefreshCw, LayoutGrid, ShoppingBag, Calendar } from 'lucide-react';

// ── Tab type ──────────────────────────────────────────────────────────────────
type StoreTab = 'services' | 'products';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3.5 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3   bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3   bg-gray-100 rounded-lg w-1/3" />
        <div className="pt-2 border-t border-gray-50 flex justify-between">
          <div className="h-5 bg-gray-100 rounded w-20" />
          <div className="h-6 bg-gray-100 rounded-xl w-14" />
        </div>
      </div>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function Store() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const categorySlug = searchParams.get('category') ?? undefined;
  const searchQuery  = searchParams.get('search')   ?? undefined;
  const tabParam     = searchParams.get('tab') as StoreTab | null;

  const [tab,       setTab]      = useState<StoreTab>(tabParam ?? 'services');
  const [listings,  setListings] = useState<Listing[]>([]);
  const [products,  setProducts] = useState<Product[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState<string | null>(null);
  const [sortBy,    setSortBy]   = useState<'newest' | 'price' | 'popular'>('newest');

  // ── Sync tab to URL ───────────────────────────────────────────────────────
  const switchTab = (next: StoreTab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.push(`/store?${params.toString()}`, { scroll: false });
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'services') {
        const filters: ListingFilters = {
          categorySlug,
          search: searchQuery,
          sortBy: sortBy === 'newest' ? 'newest' : sortBy,
        };
        const res  = await listingsService.getAll(filters);
        const data = (res as any).data;
        setListings(Array.isArray(data) ? data : (data?.data ?? []));
      } else {
        const filters: ProductFilters = {
          categorySlug,
          search: searchQuery,
          sortBy,
        };
        const res  = await productsService.getAll(filters);
        const data = (res as any).data;
        setProducts(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch {
      setError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [tab, categorySlug, searchQuery, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const items   = tab === 'services' ? listings : products;
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => switchTab('services')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${tab === 'services'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <Calendar size={13} />
              Services
            </button>
            <button
              onClick={() => switchTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${tab === 'products'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag size={13} />
              Products
            </button>
          </div>

          {/* Right: count + sort */}
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {items.length} {tab === 'services' ? 'service' : 'product'}{items.length !== 1 ? 's' : ''}
                {categorySlug && ` in ${categorySlug.replace(/_/g, ' ')}`}
              </span>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-medium text-gray-600 border border-gray-200 rounded-xl
                px-2.5 py-1.5 bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors">
              <option value="newest">Newest</option>
              <option value="price">Price ↑</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <p className="text-xs text-red-600 font-medium">{error}</p>
            <button onClick={fetchData}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Package size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              No {tab === 'services' ? 'services' : 'products'} found
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {categorySlug || searchQuery
                ? 'Try adjusting your search or category'
                : `No ${tab} are available right now`}
            </p>
            {(categorySlug || searchQuery) && (
              <button
                onClick={() => router.push('/store')}
                className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tab === 'services'
                ? listings.map(l => <ListingCard key={l.id} listing={l} />)
                : products.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>

            {items.length >= 20 && (
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

export default function StoreContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D3B45] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Store />
    </Suspense>
  );
}