// components/listings/ListingQuickInfo.tsx
// ✅ Server-safe — no hooks, no client state

import { MapPin, Tag, BadgeCheck, User, FileText, Wifi } from 'lucide-react';
import type { Listing } from '../../lib/types/listing';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, value, sub }: {
  icon: React.ElementType;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-[#2D3B45]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-snug">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function ListingInfo({ listing }: { listing: Listing }) {
  const location    = listing.location ?? {};
  const locationStr = [location.area, location.county].filter(Boolean).join(', ');
  const amenities   = (listing as any).amenities as string[] | undefined;

  return (
    <div className="space-y-0 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Title block ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-5 border-b border-gray-100">

        {/* Category + verified chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {listing.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold
              text-[#2D3B45] bg-[#2D3B45]/8 px-2.5 py-1 rounded-full">
              <Tag size={9} />
              {(listing.category as any).name ?? listing.category}
            </span>
          )}
          {listing.vendor?.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold
              text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              <BadgeCheck size={10} />
              Verified Vendor
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

      {/* ── About ───────────────────────────────────────────────── */}
      {listing.description && (
        <div className="px-5">
          <Section label="About">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={13} className="text-[#2D3B45]" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </Section>
        </div>
      )}

      {/* ── Hosted by ────────────────────────────────────────────── */}
      {listing.vendor && (
        <div className="px-5">
          <Section label="Hosted by">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D3B45] flex items-center justify-center shrink-0 overflow-hidden">
                {listing.vendor.logo
                  ? <img src={listing.vendor.logo} alt={listing.vendor.businessName}
                      className="w-full h-full object-cover" />
                  : <span className="text-[#F5C842] text-sm font-black">
                      {listing.vendor.businessName?.charAt(0).toUpperCase()}
                    </span>
                }
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{listing.vendor.businessName}</p>
                {listing.vendor.verified && (
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                    <BadgeCheck size={10} /> Verified seller
                  </p>
                )}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Location ─────────────────────────────────────────────── */}
      {locationStr && (
        <div className="px-5">
          <Section label="Location">
            <InfoRow
              icon={MapPin}
              value={location.area ?? locationStr}
              sub={location.county ? `${location.county} County, Kenya` : undefined}
            />
          </Section>
        </div>
      )}

      {/* ── Amenities ────────────────────────────────────────────── */}
      {amenities && amenities.length > 0 && (
        <div className="px-5">
          <Section label="What's included">
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((a: string) => (
                <div key={a} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Wifi size={10} className="text-emerald-500" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{a}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}