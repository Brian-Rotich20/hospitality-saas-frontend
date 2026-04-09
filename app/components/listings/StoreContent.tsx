'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { listingsService, productsService, categoriesService } from '../../lib/api/endpoints';
import type { Listing, Product, ListingFilters, ProductFilters, Category } from '../../lib/types/listing';
import { ListingCard } from './ListingCard';
import { ProductCard } from './ProductCard';
import {
  Package, RefreshCw, ShoppingBag, Calendar, ChevronRight,
  Building2, Utensils, Camera, Music, Flower2,
  Bus, MoreHorizontal, BookOpen, Sparkles, LayoutGrid,
} from 'lucide-react';

type StoreTab = 'services' | 'products';

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
  venues: Building2, catering: Utensils, photography: Camera,
  music: Music, decor: Flower2, transport: Bus,
  entertainment: MoreHorizontal, education: BookOpen,
};

// ── Card skeleton ─────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-3/4" />
        <div className="h-3   bg-gray-100 rounded w-1/2" />
        <div className="h-3   bg-gray-100 rounded w-1/3" />
        <div className="pt-2 border-t border-gray-50 flex justify-between">
          <div className="h-5 bg-gray-100 rounded w-16" />
          <div className="h-6 bg-gray-100 rounded-xl w-12" />
        </div>
      </div>
    </div>
  );
}

// ── Sidebar skeleton ──────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-2.5 bg-gray-100 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mobile category grid skeleton ─────────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-full aspect-square rounded-2xl bg-gray-100" />
          <div className="h-2.5 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Desktop/tablet left sidebar ───────────────────────────────────────────────
function DesktopSidebar({
  categories,
  activeSlug,
  loading,
}: {
  categories: Category[];
  activeSlug?: string;
  loading:    boolean;
}) {
  const allItem: Category = { id: 'all', name: 'All Categories', slug: 'all', icon: 'LayoutGrid' };
  const items = [allItem, ...categories];

  if (loading) return <SidebarSkeleton />;

  return (
    <nav className="py-2">
      {items.map(({ id, name, slug, icon, imageUrl }) => {
        const Icon   = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);
        const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
        const active = slug === 'all' ? !activeSlug : activeSlug === slug;

        return (
          <Link
            key={id}
            href={href}
            className={`group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl
              no-underline transition-all
              ${active
                ? 'bg-[#2D3B45]/8 border border-[#2D3B45]/10'
                : 'hover:bg-gray-50 border border-transparent'}`}>

            {/* Image or icon tile */}
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center
              justify-center shrink-0 transition-all
              ${active ? 'bg-[#2D3B45]' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  size={17}
                  className={active ? 'text-white' : 'text-gray-500'}
                  strokeWidth={active ? 2.2 : 1.7}
                />
              )}
            </div>

            {/* Name */}
            <span className={`flex-1 text-xs font-semibold leading-tight min-w-0
              ${active ? 'text-[#2D3B45]' : 'text-gray-700 group-hover:text-gray-900'}`}>
              {name}
            </span>

            {/* Chevron */}
            <ChevronRight
              size={13}
              className={`shrink-0 transition-colors
                ${active ? 'text-[#2D3B45]' : 'text-gray-300 group-hover:text-gray-400'}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

// ── Mobile category grid ──────────────────────────────────────────────────────
function MobileCategoryGrid({
  categories,
  loading,
}: {
  categories: Category[];
  loading:    boolean;
}) {
  if (loading) return <GridSkeleton />;
  if (!categories.length) return null;

  return (
    <section className="px-4 pt-4 pb-2">
      <h2 className="text-sm font-black text-gray-900 mb-3 tracking-tight">
        Browse by Category
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {categories.map(({ id, name, slug, icon, imageUrl }) => {
          const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);

          return (
            <Link
              key={id}
              href={`/store?category=${slug}`}
              className="flex flex-col items-center gap-1.5 no-underline group">

              {/* Tile */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100
                flex items-center justify-center border border-gray-100
                group-hover:border-[#2D3B45]/20 group-active:scale-95
                transition-all duration-150">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover
                      group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center
                    bg-gradient-to-br from-gray-50 to-gray-100">
                    <Icon
                      size={26}
                      className="text-[#2D3B45]/50 group-hover:text-[#2D3B45]
                        transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-gray-700 text-center
                leading-tight line-clamp-2 w-full group-hover:text-[#2D3B45]
                transition-colors">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Store ────────────────────────────────────────────────────────────────
function Store() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const categorySlug = searchParams.get('category') ?? undefined;
  const searchQuery  = searchParams.get('search')   ?? undefined;
  const tabParam     = searchParams.get('tab') as StoreTab | null;

  const [tab,        setTab]        = useState<StoreTab>(tabParam ?? 'services');
  const [listings,   setListings]   = useState<Listing[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [sortBy,     setSortBy]     = useState<'newest' | 'price' | 'popular'>('newest');

  // mobile: show grid only when no filter active
  const showMobileGrid = !categorySlug && !searchQuery;

  // ── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    categoriesService.getAll()
      .then(res => {
        const data = (res as any).data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  // ── Switch tab ────────────────────────────────────────────────────────────
  const switchTab = (next: StoreTab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.push(`/store?${params.toString()}`, { scroll: false });
  };

  // ── Fetch listings / products ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'services') {
        const filters: ListingFilters = { categorySlug, search: searchQuery, sortBy };
        const res  = await listingsService.getAll(filters);
        const data = (res as any).data;
        setListings(Array.isArray(data) ? data : (data?.data ?? []));
      } else {
        const filters: ProductFilters = { categorySlug, search: searchQuery, sortBy };
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

  // ── Toolbar top value ─────────────────────────────────────────────────────
  // Mobile: var(--header-h) only (no category strip in header)
  // Desktop: var(--header-h) only (sidebar is beside content, not above)
  const toolbarTop = 'var(--header-h, 116px)';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toolbar ── */}
      <div
        className="bg-white border-b border-gray-100 z-30"
        style={{ position: 'sticky', top: toolbarTop }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-12
          flex items-center justify-between gap-4">

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => switchTab('services')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                font-bold transition-all
                ${tab === 'services'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <Calendar size={13} /> Services
            </button>
            <button
              onClick={() => switchTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                font-bold transition-all
                ${tab === 'products'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag size={13} /> Products
            </button>
          </div>

          {/* Count + sort */}
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {items.length} {tab === 'services' ? 'service' : 'product'}
                {items.length !== 1 ? 's' : ''}
                {categorySlug && ` · ${categorySlug.replace(/-/g, ' ')}`}
              </span>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-medium text-gray-600 border border-gray-200
                rounded-xl px-2.5 py-1.5 bg-white outline-none cursor-pointer
                hover:border-gray-300 transition-colors">
              <option value="newest">Newest</option>
              <option value="price">Price ↑</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex max-w-screen-xl mx-auto">

        {/* ════════════════════════════════════════════════════
            DESKTOP/TABLET LEFT SIDEBAR (lg+)
            Sticky, independently scrollable category list
        ════════════════════════════════════════════════════ */}
        <aside
          className="hidden lg:block w-56 xl:w-64 shrink-0 bg-white border-r border-gray-100"
          style={{
            position:  'sticky',
            top:       `calc(${toolbarTop} + 48px)`,
            height:    `calc(100vh - ${toolbarTop} - 48px)`,
            overflowY: 'auto',
            alignSelf: 'flex-start',
          }}
        >
          <DesktopSidebar
            categories={categories}
            activeSlug={categorySlug}
            loading={catLoading}
          />
        </aside>

        {/* ════════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════════ */}
        <main className="flex-1 min-w-0">

          {/* ── MOBILE: Category grid (no filter active) ── */}
          <div className="lg:hidden">
            {showMobileGrid && (
              <MobileCategoryGrid
                categories={categories}
                loading={catLoading}
              />
            )}

            {/* Active category breadcrumb on mobile */}
            {categorySlug && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="text-xs font-black text-gray-900 capitalize">
                  {categorySlug.replace(/-/g, ' ')}
                </span>
                <button
                  onClick={() => router.push('/store')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100
                    text-gray-500 hover:bg-gray-200 transition font-semibold">
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {/* ── DESKTOP: Active category label ── */}
          {categorySlug && (
            <div className="hidden lg:flex items-center gap-2 px-6 pt-5 pb-0">
              <span className="text-sm font-black text-gray-900 capitalize">
                {categorySlug.replace(/-/g, ' ')}
              </span>
              <button
                onClick={() => router.push('/store')}
                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100
                  text-gray-500 hover:bg-gray-200 transition font-semibold">
                ✕ Clear
              </button>
            </div>
          )}

          {/* ── Listings/Products grid ── */}
          <div className="px-4 lg:px-6 py-4">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4
                flex items-center justify-between">
                <p className="text-xs text-red-600 font-medium">{error}</p>
                <button onClick={fetchData}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600
                    hover:text-red-800 transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Section label on mobile when showing all */}
            {showMobileGrid && !loading && items.length > 0 && (
              <h2 className="text-sm font-black text-gray-900 mb-3 lg:hidden">
                {tab === 'services' ? 'All Services' : 'All Products'}
              </h2>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl
                  flex items-center justify-center mb-3 shadow-sm">
                  <Package size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-700 mb-1">
                  No {tab === 'services' ? 'services' : 'products'} found
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {categorySlug || searchQuery
                    ? 'Try a different category'
                    : `No ${tab} available yet`}
                </p>
                {(categorySlug || searchQuery) && (
                  <button
                    onClick={() => router.push('/store')}
                    className="px-4 py-2 bg-[#2D3B45] text-white text-xs font-bold
                      rounded-xl hover:bg-[#3a4d5a] transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {tab === 'services'
                    ? listings.map(l => <ListingCard key={l.id} listing={l} />)
                    : products.map(p => <ProductCard key={p.id} product={p} />)
                  }
                </div>
                {items.length >= 20 && (
                  <div className="flex justify-center mt-6">
                    <button className="px-6 py-2.5 border border-gray-200 rounded-xl
                      text-xs font-bold text-gray-600 hover:border-[#2D3B45]
                      hover:text-[#2D3B45] transition-colors bg-white">
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StoreContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D3B45] border-t-transparent
          rounded-full animate-spin" />
      </div>
    }>
      <Store />
    </Suspense>
  );
}