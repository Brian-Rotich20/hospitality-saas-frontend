// REPLACE the whole file content
import { MapPin, Check } from 'lucide-react';
import type { Listing }  from '../../lib/types/listing';

export function ListingInfo({ listing }: { listing: Listing }) {
  const location = listing.location ?? {};

  // ✅ county + area, no city/address
  const locationStr = [location.area, location.county]
    .filter(Boolean).join(', ');

  return (
    <div className="space-y-5 min-w-0">

      {/* Title block */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        {listing.category && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest
            text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full mb-3">
            {listing.category.name}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight mb-3">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {locationStr && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} className="text-gray-400" />
              {locationStr}
            </span>
          )}
          {listing.vendor?.verified && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700
              bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              ✓ Verified Vendor
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">About</p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {listing.description}
        </p>
      </div>

      {/* Vendor info */}
      {listing.vendor && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Hosted by</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center
              justify-center shrink-0 overflow-hidden">
              {listing.vendor.logo
                ? <img src={listing.vendor.logo} alt=""
                    className="w-full h-full object-cover" />
                : <span className="text-[#F5C842] text-sm font-black">
                    {listing.vendor.businessName?.charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{listing.vendor.businessName}</p>
              {listing.vendor.verified && (
                <p className="text-[10px] text-blue-600 font-semibold">✓ Verified</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      {locationStr && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white border border-gray-200 rounded-full
              flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-[#2D3B45]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{location.area}</p>
              <p className="text-[11px] text-gray-500">{location.county} County, Kenya</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}