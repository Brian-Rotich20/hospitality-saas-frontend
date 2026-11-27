// Request-to-book page for a listing. The listing is loaded on the server (public data);
// the form runs on the client because it depends on the signed-in user.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin, Store } from 'lucide-react';
import { cache } from 'react';
import { serverFetch } from '../../../../lib/api/server';
import { resolveListingPrice, type Listing } from '../../../../lib/types/listing';
import { BookingRequestForm } from '../../../../components/bookings/BookingRequestForm';

export const dynamic = 'force-dynamic';

const fetchListing = cache(async (id: string) => {
  const { data } = await serverFetch<Listing>(`/listings/${encodeURIComponent(id)}`);
  return data;
});

const SUFFIX: Record<string, string> = { per_hour: 'per hour', per_day: 'per day', per_person: 'per person', package: 'package' };

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await fetchListing((await params).id);
  return { title: listing ? `Request to book · ${listing.title} · LinkMart` : 'Request to book · LinkMart' };
}

export default async function BookListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing || listing.status !== 'active') notFound();

  const price = resolveListingPrice(listing);
  const loc = [listing.location?.area, listing.location?.county].filter(Boolean).join(', ');
  const priceText = listing.pricingType === 'contact' || price <= 0
    ? 'Price on request'
    : `From ${listing.currency ?? 'KES'} ${price.toLocaleString('en-KE')} ${SUFFIX[listing.pricingType] ?? ''}`.trim();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12">
      <Link href={`/store/${listing.id}`} className="breadcrumb-link mb-4 inline-flex">
        <ArrowLeft size={11} /> Back to listing
      </Link>

      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Request to book</h1>
      <p className="text-sm text-gray-500 mb-6">Choose your dates and send a request. The vendor replies within 24 hours.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <BookingRequestForm listingId={listing.id} />
        </div>

        <aside className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-20 order-first lg:order-none">
          {listing.coverPhoto || listing.photos?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.coverPhoto ?? listing.photos[0]} alt="" className="w-full h-36 object-cover" />
          ) : null}
          <div className="p-4 space-y-2">
            <p className="text-sm font-bold text-gray-900">{listing.title}</p>
            {listing.vendor?.businessName && (
              <p className="text-xs text-gray-500 flex items-center gap-1.5"><Store size={12} aria-hidden /> {listing.vendor.businessName}</p>
            )}
            {loc && <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin size={12} aria-hidden /> {loc}</p>}
            <p className="text-xs font-bold text-ink">{priceText}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed pt-1 border-t border-gray-50">
              Prices are set by the vendor and shown for guidance. You agree the final price and pay the vendor directly.
              LinkMart does not take booking payments.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
