'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { listingsService, categoriesService } from '../../lib/api/endpoints';
import type { Listing, ListingFilters, Category } from '../../lib/types/listing';
import { ListingCard } from './ListingCard';
import {
  Package, RefreshCw, ChevronRight,
  Building2, Utensils, Camera, Music, Flower2,
  Bus, MoreHorizontal, BookOpen, Sparkles, LayoutGrid,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
  venues: Building2, catering: Utensils, photography: Camera,
  music: Music, decor: Flower2, transport: Bus,
  entertainment: MoreHorizontal, education: BookOpen,
};

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-36 skeleton rounded-none" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-3 skeleton w-1/3" />
        <div className="pt-2 border-t border-[var(--color-border)] flex justify-between">
          <div className="h-5 skeleton w-16" />
          <div className="h-6 skeleton w-12" style={{ borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <div className="w-10 h-10 skeleton shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 skeleton w-24" />
            <div className="h-2.5 skeleton w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2 px-3 pt-3 pb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 skeleton" />
          <div className="h-2.5 skeleton w-10" />
        </div>
      ))}
    </div>
  );
}

function DesktopSidebar({ categories, activeSlug, loading }: {
  categories: Category[];
  activeSlug?: string;
  loading: boolean;
}) {
  const allItem: Category = {
    id: 'all', name: 'All Categories', slug: 'all', icon: 'LayoutGrid',
  };
  const items = [allItem, ...categories];

  if (loading) return <SidebarSkeleton />;

  return (
    <nav className="py-2">
      {items.map(({ id, name, slug, icon, imageUrl }) => {
        const Icon   = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);
        const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
        const active = slug === 'all' ? !activeSlug : activeSlug === slug;

        return (
          <Link key={id} href={href}
            className={`sidebar-item${active ? ' active' : ''}`}>
            <div className="sidebar-icon">
              {imageUrl ? (
                <Image src={imageUrl} alt={name} width={40} height={40}
                  className="w-full h-full object-cover" />
              ) : (
                <Icon size={17}
                  className={active ? 'text-white' : 'text-[var(--color-text-muted)]'}
                  strokeWidth={active ? 2.2 : 1.7} />
              )}
            </div>
            <span className="flex-1 text-xs font-semibold leading-tight min-w-0"
              style={{ color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>
              {name}
            </span>
            <ChevronRight size={13}
              style={{ color: active ? 'var(--color-brand)' : 'var(--color-border)', flexShrink: 0 }} />
          </Link>
        );
      })}
    </nav>
  );
}

function MobileCategoryGrid({ categories, loading }: {
  categories: Category[];
  loading: boolean;
}) {
  if (loading) return <GridSkeleton />;
  if (!categories.length) return null;

  return (
    <section className="px-3 pt-3 pb-2">
      <h2 className="section-label mb-2">Categories</h2>
      <div className="grid grid-cols-4 gap-2">
        {categories.map(({ id, name, slug, icon, imageUrl }) => {
          const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);
          return (
            <Link key={id} href={`/store?category=${slug}`}
              className="flex flex-col items-center gap-1 no-underline group">
              <div className="w-14 h-14 overflow-hidden bg-[#F0EDE6] flex items-center
                justify-center border border-[var(--color-border)] group-hover:border-[var(--color-brand)]/20
                group-active:scale-95 transition-all duration-150 mx-auto"
                style={{ borderRadius: 'var(--radius-xl)' }}>
                {imageUrl ? (
                  <Image src={imageUrl} alt={name} width={56} height={56}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Icon size={20} strokeWidth={1.5}
                    className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full
                group-hover:text-[var(--color-brand)] transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}>
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Store() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const categorySlug = searchParams.get('category') ?? undefined;
  const searchQuery  = searchParams.get('search')   ?? undefined;

  const [listings,   setListings]   = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const showMobileGrid = !categorySlug && !searchQuery;
  const headerH = 'var(--header-h, 116px)';

  useEffect(() => {
    categoriesService.getAll()
      .then(res => { const d = (res as any).data ?? res; setCategories(Array.isArray(d) ? d : []); })
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await listingsService.getAll({ categorySlug, search: searchQuery } as ListingFilters);
      const data = (res as any).data;
      setListings(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { setError('Failed to load. Please try again.'); }
    finally { setLoading(false); }
  }, [categorySlug, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isEmpty = !loading && listings.length === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-page)' }}>
      <div className="flex max-w-screen-xl mx-auto">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0 scrollbar-none z-20"
          style={{
            backgroundColor: 'var(--color-card)',
            borderRight: '1px solid var(--color-border)',
            position: 'sticky',
            top: headerH,
            height: `calc(100vh - ${headerH})`,
            overflowY: 'auto',
            alignSelf: 'flex-start',
          }}>
          <DesktopSidebar categories={categories} activeSlug={categorySlug} loading={catLoading} />
        </aside>

        <main className="flex-1 min-w-0">

          {/* Mobile category grid */}
          <div className="lg:hidden">
            {showMobileGrid && (
              <MobileCategoryGrid categories={categories} loading={catLoading} />
            )}
            {categorySlug && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="text-xs font-black capitalize"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {categorySlug.replace(/-/g, ' ')}
                </span>
                <button onClick={() => router.push('/store')}
                  className="text-[10px] px-2 py-0.5 font-semibold transition"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#F0EDE6',
                    color: 'var(--color-text-muted)',
                  }}>
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {/* Desktop: active category label */}
          {categorySlug && (
            <div className="hidden lg:flex items-center gap-2 px-6 pt-5 pb-0">
              <span className="text-sm font-black capitalize"
                style={{ color: 'var(--color-text-primary)' }}>
                {categorySlug.replace(/-/g, ' ')}
              </span>
              <button onClick={() => router.push('/store')}
                className="text-[11px] px-2 py-0.5 font-semibold transition"
                style={{ borderRadius: 'var(--radius-full)', backgroundColor: '#F0EDE6', color: 'var(--color-text-muted)' }}>
                ✕ Clear
              </button>
            </div>
          )}

          {/* Listings */}
          <div className="px-4 lg:px-6 py-4">
            {error && (
              <div className="error-banner mb-4">
                <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>{error}</p>
                <button onClick={fetchData}
                  className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                  style={{ color: 'var(--color-error)' }}>
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {showMobileGrid && !loading && listings.length > 0 && (
              <h2 className="section-label mb-3 lg:hidden">All Services</h2>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="empty-icon-wrap mb-3">
                  <Package size={24} style={{ color: 'var(--color-border)' }} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  No services found
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {categorySlug || searchQuery ? 'Try a different category' : 'No services available yet'}
                </p>
                {(categorySlug || searchQuery) && (
                  <button onClick={() => router.push('/store')}
                    className="btn btn-primary btn-sm">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {listings.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
                {listings.length >= 20 && (
                  <div className="flex justify-center mt-6">
                    <button className="btn btn-ghost btn-sm">Load more</button>
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
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-page)' }}>
        <div className="spinner w-8 h-8" />
      </div>
    }>
      <Store />
    </Suspense>
  );
}