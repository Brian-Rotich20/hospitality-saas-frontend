// components/listings/ListingQuickInfo.tsx
// ✅ Server-safe — no hooks, no client state
import { MapPin } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';

export function ListingInfo({ listing }: { listing: Listing }) {
  const location = listing.location ?? {};
  const locationStr = [location.area, location.county]
    .filter(Boolean).join(', ');

  return (
    <div className="space-y-4 min-w-0">

      {/* ── Title block ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {listing.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest
              text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {listing.category.name}
            </span>
          )}
          {listing.vendor?.verified && (
            <span className="text-[10px] font-bold text-blue-600
              bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              ✓ Verified Vendor
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-3">
          {listing.title}
        </h1>

        {locationStr && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            {locationStr}
          </div>
        )}
      </div>

      {/* ── Description ── */}
      {listing.description && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            About
          </p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>
      )}

      {/* ── Vendor info ── */}
      {listing.vendor && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Hosted by
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center
              justify-center shrink-0 overflow-hidden">
              {listing.vendor.logo
                ? <img src={listing.vendor.logo} alt={listing.vendor.businessName}
                    className="w-full h-full object-cover" />
                : <span className="text-[#F5C842] text-sm font-black">
                    {listing.vendor.businessName?.charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {listing.vendor.businessName}
              </p>
              {listing.vendor.verified && (
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                  ✓ Verified
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Location detail ── */}
      {locationStr && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Location
          </p>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-full
              flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-[#2D3B45]" />
            </div>
            <div>
              {location.area && (
                <p className="text-xs font-bold text-gray-800">{location.area}</p>
              )}
              {location.county && (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {location.county} County, Kenya
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}