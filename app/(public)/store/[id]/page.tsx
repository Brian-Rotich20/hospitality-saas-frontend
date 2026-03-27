// app/(public)/store/[id]/page.tsx
// ✅ Server Component — force-dynamic prevents build-time fetch timeout

import { notFound }             from 'next/navigation';
import Link                     from 'next/link';
import { ArrowLeft, Shield }    from 'lucide-react';
import { ListingGallery }       from '../../../components/listings/ListingGallery';
import { ListingInfo }          from '../../../components/listings/ListingQuickInfo';
import { BookingCard }          from '../../../components/listings/BookingCard';
import { resolveListingPrice }  from '../../../lib/types/listing';

// ✅ Never statically generate — avoids Render cold-start timeout at build
export const dynamic = 'force-dynamic';

async function fetchListing(id: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/listings/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id }  = await params;
  const listing = await fetchListing(id);

  if (!listing) notFound();

  const price    = resolveListingPrice(listing);
  const photos   = listing.photos ?? [];
  const location = listing.location ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingGallery photos={photos} title={listing.title} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/store"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400
            hover:text-gray-700 transition-colors no-underline mb-5">
          <ArrowLeft size={13} /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <ListingInfo listing={listing} />

          <div className="space-y-3">
            <BookingCard
              listingId={listing.id}
              price={price}
              pricingType={listing.pricingType}
              currency={listing.currency ?? 'KES'}
              capacity={listing.capacity}
              location={location}
              instantBooking={listing.instantBooking}
              vendor={listing.vendor}
            />
            <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <Shield size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Secure booking</strong> · M-Pesa Daraja protected payments
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-gray-800">Similar Listings</h2>
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Coming soon
            </span>
          </div>
          <p className="text-xs text-gray-400">More venues and services will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { id }  = await params;
  const listing = await fetchListing(id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title:       `${listing.title} | LinkMart`,
    description: listing.description?.slice(0, 155),
    openGraph:   { images: listing.photos?.[0] ? [listing.photos[0]] : [] },
  };
}