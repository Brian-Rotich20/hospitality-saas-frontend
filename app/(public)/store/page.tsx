// app/(public)/store/page.tsx
// ✅ Server Component — fetches categories + listings server-side, before
// any HTML is sent. Category/search filtering is driven entirely by the URL
// (?category=&search=), so every filtered view is a real, crawlable,
// server-rendered page — not a client-side fetch that happens after
// hydration and JS execution.

import { serverFetch } from '../../lib/api/server';
import type { Listing, Category } from '../../lib/types/listing';
import { StoreLayout } from '../../components/listings/StoreContent';

// serverFetch always reads cookies() internally (to forward the session,
// even on a public page with no session to forward), which already forces
// this route to be dynamically rendered — this export is here for explicit
// documentation of intent, matching the pattern used elsewhere in the app.
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray((value as any)?.data)) return (value as any).data;
  return [];
}

export default async function StorePage({ searchParams }: Props) {
  const { category: categorySlug, search: searchQuery } = await searchParams;

  const listingsQuery = new URLSearchParams();
  if (categorySlug) listingsQuery.set('categorySlug', categorySlug);
  if (searchQuery)  listingsQuery.set('search', searchQuery);
  const listingsPath = `/listings${listingsQuery.toString() ? `?${listingsQuery}` : ''}`;

  // Parallel, not sequential — and both happen before the browser gets any
  // HTML at all, instead of after a JS bundle downloads and hydrates.
  // Categories get a longer cache window since they rarely change; listings
  // stay no-store (serverFetch's default) since they change often.
  const [categoriesRes, listingsRes] = await Promise.all([
    serverFetch<any>('/categories', { next: { revalidate: 3600 } }),
    serverFetch<any>(listingsPath),
  ]);

  if (categoriesRes.error) console.error('[StorePage] /categories failed:', categoriesRes.error);
  if (listingsRes.error)   console.error('[StorePage] /listings failed:', listingsRes.error);

  const categories: Category[] = asArray(categoriesRes.data);
  const listings:   Listing[]  = asArray(listingsRes.data);

  return (
    <StoreLayout
      categories={categories}
      listings={listings}
      activeSlug={categorySlug}
      searchQuery={searchQuery}
    />
  );
}

export async function generateMetadata({ searchParams }: Props) {
  const { category } = await searchParams;
  return {
    title: category
      ? `${category.replace(/-/g, ' ')} | LinkMart`
      : 'Browse Venues & Services | LinkMart',
    description: 'Find verified vendors for venues, catering, photography, transport and more across Kenya.',
  };
}