// Listing detail. Server component; the listing (with its vendor's public business contact)
// comes from GET /listings/:id. Layout: breadcrumb, header, gallery, then the main column
// (description, good-to-know, reviews) beside a sticky booking + contact column on desktop.
// On phones the contact sits after the description and booking is a bottom bar.

import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin, Star } from 'lucide-react';
import { ListingGallery } from '../../../components/listings/ListingGallery';
import { ReviewSection } from '../../../components/listings/ReviewSection';
import { ListingActions } from '../../../components/listings/detail/ListingActions';
import { ContactPanel } from '../../../components/listings/detail/ContactPanel';
import { BookingPanel, MobileBookingBar } from '../../../components/listings/detail/BookingPanel';
import { Description } from '../../../components/listings/detail/Description';
import { serverFetch } from '../../../lib/api/server';
import { listingPrice } from '../../../lib/listings/price';
import type { Listing } from '../../../lib/types/listing';

export const dynamic = 'force-dynamic';

// React.cache: the page and generateMetadata share one request (also avoids counting two views).
const fetchListing = cache(async (id: string) => {
  const { data } = await serverFetch<Listing>(`/listings/${encodeURIComponent(id)}`);
  return data;
});

interface Props { params: Promise<{ id: string }> }

const BASIS: Record<string, string> = {
  per_hour: 'Priced per hour', per_day: 'Priced per day', per_person: 'Priced per person', package: 'Priced as a package', contact: 'Price on request',
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) notFound();

  const price = listingPrice(listing);
  const photos = listing.photos?.length ? listing.photos : listing.coverPhoto ? [listing.coverPhoto] : [];
  const place = [listing.location?.area, listing.location?.county].filter(Boolean).join(', ');
  const category = listing.category?.name ?? null;
  const reviewCount = listing.reviewCount ?? 0;
  const since = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(listing.createdAt));

  return (
    <div className="bg-page min-h-screen pb-28 lg:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="pt-5 pb-3 flex items-center gap-1.5 text-[12px] text-text-secondary min-w-0">
          <Link href="/store" className="hover:text-text-primary no-underline">Listings</Link>
          {category && (
            <>
              <ChevronRight size={13} className="text-text-muted shrink-0" aria-hidden />
              <Link href={`/store?category=${listing.category?.slug ?? ''}`} className="hover:text-text-primary no-underline">{category}</Link>
            </>
          )}
          <ChevronRight size={13} className="text-text-muted shrink-0" aria-hidden />
          <span className="text-primary font-medium truncate" aria-current="page">{listing.title}</span>
        </nav>

        {listing.status !== 'active' && (
          <p className="mb-4 rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-[13px] text-warning">
            This listing is {listing.status === 'paused' ? 'paused' : 'a draft'}. Only you can see this page until it is published.
          </p>
        )}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="min-w-0">
            <h1 className="text-[24px] sm:text-[28px] leading-[1.15] font-semibold tracking-[-0.02em] text-text-primary text-balance">{listing.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-text-secondary [&>span+span]:before:content-['·'] [&>span+span]:before:mr-2.5 [&>span+span]:before:text-text-muted">
              <span className="flex items-center gap-1.5">
                <Star size={15} aria-hidden className={listing.rating ? 'fill-star text-star' : 'text-text-muted'} />
                {listing.rating
                  ? <><span className="font-semibold text-text-primary tabular">{listing.rating.toFixed(1)}</span> · {reviewCount} review{reviewCount === 1 ? '' : 's'}</>
                  : 'New on LinkMart'}
              </span>
              {place && <span className="flex items-center gap-1.5"><MapPin size={15} aria-hidden /> {place}</span>}
              {category && <span>{category}</span>}
            </p>
          </div>
          <ListingActions listingId={listing.id} title={listing.title} />
        </header>

        <ListingGallery photos={photos} title={listing.title} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 items-start">
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="about">
              <h2 id="about" className="text-[17px] font-semibold text-text-primary mb-3">About this {category ? category.toLowerCase().replace(/s$/, '') : 'listing'}</h2>
              <Description text={listing.description} />
            </section>

            {listing.vendor && (
              <div className="lg:hidden"><ContactPanel vendor={listing.vendor} listingTitle={listing.title} /></div>
            )}

            <section aria-labelledby="good-to-know">
              <h2 id="good-to-know" className="text-[17px] font-semibold text-text-primary mb-3">Good to know</h2>
              <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
                <div className="bg-card px-4 py-3.5">
                  <dt className="text-[12px] text-text-secondary">Pricing</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-text-primary">{BASIS[listing.pricingType] ?? 'Ask the vendor'}</dd>
                </div>
                <div className="bg-card px-4 py-3.5">
                  <dt className="text-[12px] text-text-secondary">Payment</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-text-primary">Agreed directly with the vendor</dd>
                </div>
                <div className="bg-card px-4 py-3.5">
                  <dt className="text-[12px] text-text-secondary">On LinkMart since</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-text-primary">{since}</dd>
                </div>
              </dl>
            </section>

            <ReviewSection listingId={listing.id} />
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-[96px] space-y-4" aria-label="Book or contact">
            <BookingPanel listingId={listing.id} price={price} />
            {listing.vendor && <ContactPanel vendor={listing.vendor} listingTitle={listing.title} />}
          </aside>
        </div>
      </div>

      <MobileBookingBar listingId={listing.id} price={price} />
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} | LinkMart`,
    description: listing.description?.slice(0, 155),
    openGraph: { images: listing.photos?.[0] ? [listing.photos[0]] : [] },
  };
}
