// components/store/StoreLayout.tsx
// ✅ Server Component — sidebar, category grid, and listing grid are all
// pure Links; nothing here actually needs client JS. Each ListingCard is
// individually wrapped in CardBoundary so one bad listing can't crash the
// whole page.

import Link from 'next/link';
import Image from 'next/image';
import {
  Package, ChevronRight,
  Building2, Utensils, Camera, Music, Flower2,
  Bus, MoreHorizontal, BookOpen, Sparkles, LayoutGrid,
} from 'lucide-react';
import type { Listing, Category } from '../../lib/types/listing';
import { ListingCard } from '../listings/ListingCard';
import { CardBoundary } from './CardBoundary';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid, Building2, Utensils, Camera, Music,
  Flower2, Bus, MoreHorizontal, BookOpen, Sparkles,
  venues: Building2, catering: Utensils, photography: Camera,
  music: Music, decor: Flower2, transport: Bus,
  entertainment: MoreHorizontal, education: BookOpen,
};

function DesktopSidebar({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  const allItem: Category = { id: 'all', name: 'All Categories', slug: 'all', icon: 'LayoutGrid' };
  const items = [allItem, ...categories];

  return (
    <nav className="py-2">
      {items.map(({ id, name, slug, icon, imageUrl }) => {
        const Icon   = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);
        const href   = slug === 'all' ? '/store' : `/store?category=${slug}`;
        const active = slug === 'all' ? !activeSlug : activeSlug === slug;

        return (
          <Link key={id} href={href} className={`sidebar-item${active ? ' active' : ''}`}>
            <div className="sidebar-icon">
              {imageUrl ? (
                <Image src={imageUrl} alt={name} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <Icon size={17} className={active ? 'text-white' : 'text-text-muted'} strokeWidth={active ? 2.2 : 1.7} />
              )}
            </div>
            <span className={`flex-1 text-xs font-semibold leading-tight min-w-0 ${active ? 'text-brand' : 'text-text-secondary'}`}>
              {name}
            </span>
            <ChevronRight size={13} className={active ? 'text-brand shrink-0' : 'text-border shrink-0'} />
          </Link>
        );
      })}
    </nav>
  );
}

function MobileCategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section className="px-3 pt-3 pb-2">
      <h2 className="section-label mb-2">Categories</h2>
      <div className="grid grid-cols-4 gap-2">
        {categories.map(({ id, name, slug, icon, imageUrl }) => {
          const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : (ICON_MAP[slug] ?? Sparkles);
          return (
            <Link key={id} href={`/store?category=${slug}`} className="flex flex-col items-center gap-1 no-underline group">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-muted flex items-center
                justify-center border border-border group-hover:border-brand/20
                group-active:scale-95 transition-all duration-150 mx-auto">
                {imageUrl ? (
                  <Image src={imageUrl} alt={name} width={56} height={56}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Icon size={20} strokeWidth={1.5} className="text-text-muted group-hover:text-brand transition-colors" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full
                text-text-secondary group-hover:text-brand transition-colors">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function StoreLayout({
  categories, listings, activeSlug, searchQuery,
}: {
  categories: Category[];
  listings: Listing[];
  activeSlug?: string;
  searchQuery?: string;
}) {
  const showMobileGrid = !activeSlug && !searchQuery;
  const headerH = 'var(--header-h, 116px)';
  const isEmpty = listings.length === 0;

  return (
    <div className="min-h-screen bg-page">
      <div className="flex max-w-screen-xl mx-auto">

        <aside className="hidden lg:block w-56 xl:w-64 shrink-0 scrollbar-none z-20
          bg-card border-r border-border sticky overflow-y-auto self-start"
          style={{ top: headerH, height: `calc(100vh - ${headerH})` }}>
          <DesktopSidebar categories={categories} activeSlug={activeSlug} />
        </aside>

        <main className="flex-1 min-w-0">

          {/* Mobile category grid */}
          <div className="lg:hidden">
            {showMobileGrid && <MobileCategoryGrid categories={categories} />}
            {activeSlug && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <span className="text-xs font-black capitalize text-text-primary">
                  {activeSlug.replace(/-/g, ' ')}
                </span>
                <Link href="/store" className="text-[10px] px-2 py-0.5 font-semibold transition rounded-full
                  bg-surface-muted text-text-muted no-underline">
                  ✕ Clear
                </Link>
              </div>
            )}
          </div>

          {/* Desktop: active category label */}
          {activeSlug && (
            <div className="hidden lg:flex items-center gap-2 px-6 pt-5 pb-0">
              <span className="text-sm font-black capitalize text-text-primary">
                {activeSlug.replace(/-/g, ' ')}
              </span>
              <Link href="/store" className="text-[11px] px-2 py-0.5 font-semibold transition rounded-full
                bg-surface-muted text-text-muted no-underline">
                ✕ Clear
              </Link>
            </div>
          )}

          {/* Listings */}
          <div className="px-4 lg:px-6 py-4">
            {showMobileGrid && listings.length > 0 && (
              <h2 className="section-label mb-3 lg:hidden">All Services</h2>
            )}

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="empty-icon-wrap mb-3">
                  <Package size={24} className="text-border" />
                </div>
                <p className="text-sm font-bold mb-1 text-text-secondary">No services found</p>
                <p className="text-xs mb-4 text-text-muted">
                  {activeSlug || searchQuery ? 'Try a different category' : 'No services available yet'}
                </p>
                {(activeSlug || searchQuery) && (
                  <Link href="/store" className="btn btn-primary btn-sm no-underline">Clear Filters</Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {listings.map(l => (
                    <CardBoundary key={l.id}>
                      <ListingCard listing={l} />
                    </CardBoundary>
                  ))}
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