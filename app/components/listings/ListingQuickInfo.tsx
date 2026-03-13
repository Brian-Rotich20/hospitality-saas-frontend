// components/listings/ListingInfo.tsx
// ✅ Server Component — pure display, no interactivity needed
import { MapPin, Users, Check } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';

interface Props {
  listing: Listing;
}

export function ListingInfo({ listing }: Props) {
  const location  = listing.location ?? {};
  const amenities = listing.amenities ?? [];

  const locationStr = [location.address, location.city, location.county]
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
          {listing.instantBooking && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700
              bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <Check size={10} strokeWidth={3} /> Instant Booking
            </span>
          )}
          {location.city && (
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

      {/* Capacity */}
      {listing.capacity && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Capacity</p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
            <Users size={15} className="text-[#2D3B45]" />
            <span className="text-sm font-bold text-gray-800">
              Up to {Number(listing.capacity).toLocaleString()} guests
            </span>
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Amenities</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenities.map((a: string) => (
              <div key={a}
                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-medium text-gray-700 truncate">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor info */}
      {listing.vendor && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Hosted by</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center justify-center shrink-0">
              {listing.vendor.logo
                ? <img src={listing.vendor.logo} alt="" className="w-full h-full object-cover rounded-xl" />
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
            <div className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-[#2D3B45]" />
            </div>
            <p className="text-xs font-semibold text-gray-600">{locationStr}</p>
          </div>
        </div>
      )}
    </div>
  );
}