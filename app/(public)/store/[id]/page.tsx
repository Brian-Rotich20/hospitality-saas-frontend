// app/(public)/store/[id]/page.tsx
// ✅ Server Component — force-dynamic prevents build-time fetch timeout

import { notFound }          from 'next/navigation';
import Link                  from 'next/link';
import { ArrowLeft, Shield, ChevronRight, Tag, Eye, Star } from 'lucide-react';
import { ListingGallery }    from '../../../components/listings/ListingGallery';
import { ListingInfo }       from '../../../components/listings/ListingQuickInfo';
import { BookingCard }       from '../../../components/listings/BookingCard';
import { resolveListingPrice } from '../../../lib/types/listing';
import { ReviewSection } from '../../../components/listings/ReviewSection';


export const dynamic = 'force-dynamic';

async function fetchListing(id: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/listings/${id}`, { cache: 'no-store' });
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

  const price      = resolveListingPrice(listing);
  const photos     = listing.photos ?? [];
  const location   = listing.location ?? {};
  const categoryName = (listing.category as any)?.name ?? listing.category ?? null;
  const rating     = listing.rating;
  const reviewCount = listing.reviewCount ?? 0;
  const views      = listing.views ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-10">

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[11px] mb-4 flex-wrap">
          <Link href="/store"
            className="flex items-center gap-1 text-gray-400 hover:text-[#2D3B45] transition font-medium no-underline">
            <ArrowLeft size={11} />
            Listings
          </Link>
          {categoryName && (
            <>
              <ChevronRight size={10} className="text-gray-300" />
              <Link href={`/store?category=${listing.category?.slug ?? ''}`}
                className="flex items-center gap-1 text-gray-400 hover:text-[#2D3B45] transition no-underline font-medium">
                <Tag size={9} />
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={10} className="text-gray-300" />
          <span className="text-gray-600 font-semibold truncate max-w-[200px]">
            {listing.title}
          </span>
        </nav>

        {/* ── Gallery ─────────────────────────────────────────────── */}
        <div className="mb-5">
          <ListingGallery photos={photos} title={listing.title} />
        </div>

        {/* ── Stats strip — views, rating, reviews ────────────────── */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          {rating ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12}
                    className={i <= Math.round(rating) ? 'text-[#F5C842] fill-[#F5C842]' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Star size={11} className="text-gray-300" />
              No reviews yet
            </span>
          )}
          {views > 0 && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Eye size={11} className="text-gray-300" />
                {views.toLocaleString()} views
              </span>
            </>
          )}
          {listing.instantBooking && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                ⚡ Instant booking
              </span>
            </>
          )}
        </div>

      {/* ── Main content grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Left — listing info + reviews */}
        <div className="space-y-5">
          <ListingInfo listing={listing} />
          <ReviewSection listingId={listing.id} />
        </div>

        {/* Right — booking card + trust */}
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
            <Shield size={14} className="text-gray-400 shrink-0 mt-px" />
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5">Secure & trusted</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Payments protected via M-Pesa Daraja. Vendor verified by LinkMart.
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* ── Similar listings placeholder ─────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-sm font-bold text-gray-800">Similar Listings</h2>
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200
              px-2 py-0.5 rounded-full uppercase tracking-wide">
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