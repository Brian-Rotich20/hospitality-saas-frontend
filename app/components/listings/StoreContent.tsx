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
  Package, RefreshCw, ShoppingBag, Calendar,
  Building2, Utensils, Camera, Music, Flower2,
  Bus, MoreHorizontal, BookOpen, Sparkles, LayoutGrid,
  ChevronRight,
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

// ── Skeletons ─────────────────────────────────────────────────────────────────
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

function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Mobile left sidebar ───────────────────────────────────────────────────────
function MobileSidebar({
  categories,
  activeSlug,
  loading,
}: {
  categories: Category[];
  activeSlug?: string;
  loading:    boolean;
}) {
  const allItem: Category = { id: 'all', name: 'All', slug: 'all', icon: 'LayoutGrid' };
  const items = [allItem, ...categories];

  if (loading) return <SidebarSkeleton />;

  return (
    <nav className="py-2">
      {items.map(({ id, name, slug, icon, imageUrl }) => {
        const Icon   = (icon && ICON_MAP[icon]) ? ICON_MAP[icon]
                     : (ICON_MAP[slug] ?? Sparkles);
        const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
        const active = slug === 'all' ? !activeSlug : activeSlug === slug;

        return (
          <Link
            key={id}
            href={href}
            className={`flex flex-col items-center gap-1.5 px-2 py-3 mx-1 rounded-xl
              no-underline transition-all relative
              ${active
                ? 'bg-[#2D3B45]/5'
                : 'hover:bg-gray-50'}`}>

            {/* Image or icon */}
            <div className={`w-11 h-11 rounded-xl overflow-hidden flex items-center
              justify-center shrink-0 transition-all
              ${active
                ? 'bg-[#2D3B45] text-white'
                : 'bg-gray-100 text-gray-500'}`}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
              )}
            </div>

            {/* Label */}
            <span className={`text-[10px] font-semibold text-center leading-tight
              line-clamp-2 w-full
              ${active ? 'text-[#2D3B45]' : 'text-gray-500'}`}>
              {name}
            </span>

            {/* Active indicator */}
            {active && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2
                w-0.5 h-8 bg-[#F5C842] rounded-l-full" />
            )}
          </Link>
        );
      })}
    </nav>
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

  // ── Fetch categories once ─────────────────────────────────────────────────
  useEffect(() => {
    categoriesService.getAll()
      .then(res => {
        const data = (res as any).data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const switchTab = (next: StoreTab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.push(`/store?${params.toString()}`, { scroll: false });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toolbar — sticky, sits below header ── */}
      <div
        className="bg-white border-b border-gray-100 z-30"
        style={{ position: 'sticky', top: 'var(--header-h, 116px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => switchTab('services')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${tab === 'services'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <Calendar size={13} /> Services
            </button>
            <button
              onClick={() => switchTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${tab === 'products'
                  ? 'bg-white text-[#2D3B45] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag size={13} /> Products
            </button>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {items.length} {tab === 'services' ? 'service' : 'product'}{items.length !== 1 ? 's' : ''}
                {categorySlug && ` in ${categorySlug.replace(/-/g, ' ')}`}
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

      {/* ── Body: sidebar + content ── */}
      <div className="flex min-h-[calc(100vh-var(--header-h,116px)-48px)]">

        {/* ── LEFT SIDEBAR — mobile only, fixed width, scrollable ── */}
        <aside
          className="lg:hidden w-[72px] shrink-0 bg-white border-r border-gray-100
            overflow-y-auto overscroll-contain"
          style={{
            position:  'sticky',
            top:       'calc(var(--header-h, 116px) + 48px)',  // below toolbar
            height:    'calc(100vh - var(--header-h, 116px) - 48px)',
            alignSelf: 'flex-start',
          }}
        >
          <MobileSidebar
            categories={categories}
            activeSlug={categorySlug}
            loading={catLoading}
          />
        </aside>

        {/* ── RIGHT CONTENT — listings/products grid ── */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 py-4">

          {/* Desktop: max-width container */}
          <div className="max-w-7xl mx-auto">

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

            {/* Active category label on mobile */}
            {categorySlug && (
              <div className="flex items-center gap-2 mb-3 lg:hidden">
                <span className="text-xs font-black text-gray-900 capitalize">
                  {categorySlug.replace(/-/g, ' ')}
                </span>
                <button
                  onClick={() => router.push('/store')}
                  className="text-[10px] text-gray-400 underline hover:text-gray-600">
                  Clear
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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