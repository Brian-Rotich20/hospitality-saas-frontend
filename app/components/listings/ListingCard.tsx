import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Package, Star } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';
import { listingPrice } from '../../lib/listings/price';
import { whatsappHref } from '../../lib/vendors/contact';

// Minimal store card: photo, name, location, category, rating (only once reviewed), price,
// and one quick contact (WhatsApp) when the vendor has a number. Full contact details and
// booking live on the listing page. The title link is stretched over the whole card; the
// WhatsApp button sits above it, so there are no nested links.

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.photos?.[0] ?? listing.coverPhoto;
  const place = [listing.location?.area, listing.location?.county].filter(Boolean).join(', ');
  const category = listing.category?.name;
  const price = listingPrice(listing);
  const rating = listing.rating !== null && listing.reviewCount > 0 ? Number(listing.rating) : null;
  const wa = whatsappHref(listing.vendor?.whatsappNumber, `Hi, I found "${listing.title}" on LinkMart and would like to know more.`);

  return (
    <article className="group relative h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40">
      <div className="relative aspect-[4/3] bg-surface-muted overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-text-muted" aria-hidden /></div>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold leading-snug text-text-primary line-clamp-1">
            <Link href={`/store/${listing.id}`} className="no-underline text-inherit outline-none after:absolute after:inset-0 after:content-['']">
              {listing.title}
            </Link>
          </h3>
          {rating !== null && (
            <span className="shrink-0 flex items-center gap-0.5 text-[12px] text-text-secondary tabular-nums" aria-label={`Rated ${rating.toFixed(1)} from ${listing.reviewCount} reviews`}>
              <Star size={12} className="text-star fill-star" aria-hidden />
              <span className="font-semibold text-text-primary">{rating.toFixed(1)}</span>
              <span>({listing.reviewCount})</span>
            </span>
          )}
        </div>

        {place && (
          <p className="mt-1 flex items-center gap-1 text-[12px] text-text-secondary min-w-0">
            <MapPin size={12} className="shrink-0" aria-hidden /><span className="truncate">{place}</span>
          </p>
        )}
        {category && <p className="mt-0.5 text-[11px] text-text-muted truncate">{category}</p>}

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <p className="text-text-primary leading-tight min-w-0">
            {price ? (
              <>
                {price.from && <span className="block text-[11px] text-text-muted">From</span>}
                <span className="text-[16px] font-bold tabular-nums">{price.amount}</span>
                {price.unit && <span className="text-[12px] text-text-secondary"> {price.unit.replace('per ', '/ ')}</span>}
              </>
            ) : (
              <span className="text-[14px] font-semibold">Price on request</span>
            )}
          </p>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
              aria-label={`WhatsApp ${listing.vendor?.businessName ?? 'the vendor'}`} title="Chat on WhatsApp"
              className="relative z-10 shrink-0 w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition">
              <WhatsAppGlyph />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
