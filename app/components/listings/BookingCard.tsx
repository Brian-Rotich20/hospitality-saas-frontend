// components/listings/BookingCard.tsx
// ✅ Client Component — minimalist sticky sidebar card
'use client';

import { useState }  from 'react';
import Link          from 'next/link';
import { useAuth }   from '../../lib/auth/auth.context';
import { Calendar, Phone, MessageCircle, Users, MapPin } from 'lucide-react';

const PRICING_SUFFIX: Record<string, string> = {
  per_hour:   '/ hr',
  per_day:    '/ day',
  per_night:  '/ night',
  per_person: '/ person',
  package:    '',
  contact:    '',
};

interface Vendor {
  whatsappNumber?: string;
  phoneNumber?:    string;
  businessName?:   string;
}

interface Location {
  county?: string;
  area?:   string;
}

interface Props {
  listingId:       string;
  price:           number;
  pricingType:     string;
  currency:        string;
  capacity?:       number;
  location:        Location;
  instantBooking?: boolean;
  vendor?:         Vendor;
}

export function BookingCard({
  listingId, price, pricingType, currency,
  capacity, location, instantBooking, vendor,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [showPhone, setShowPhone] = useState(false);

  const suffix    = PRICING_SUFFIX[pricingType] ?? '';
  const isContact = pricingType === 'contact';
  const isPackage = pricingType === 'package';
  const whatsapp  = vendor?.whatsappNumber ?? vendor?.phoneNumber;

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in your listing on LinkMart. Can you share more details?`
      )}`
    : null;

  const locationStr = [location.area, location.county].filter(Boolean).join(', ');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-20">

      {/* Price section */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          {isContact ? 'Pricing' : isPackage ? 'Starting from' : 'Price'}
        </p>

        {isContact ? (
          <p className="text-lg font-black text-gray-900">Contact for price</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-gray-400">{currency}</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              {price.toLocaleString()}
            </span>
            {suffix && (
              <span className="text-xs font-medium text-gray-400 ml-0.5">{suffix}</span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mx-5 mb-4 bg-gray-50 rounded-xl p-3 space-y-2.5">
        {capacity && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-500">Capacity</span>
            </div>
            <span className="text-[11px] font-bold text-gray-800">
              {Number(capacity).toLocaleString()} guests
            </span>
          </div>
        )}

        {locationStr && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-500">Location</span>
            </div>
            <span className="text-[11px] font-bold text-gray-800">{locationStr}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">Booking</span>
          <span className={`text-[11px] font-bold ${
            instantBooking ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {instantBooking ? '⚡ Instant' : 'Request approval'}
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-5 pb-5 space-y-2">
        {isAuthenticated ? (
          <Link
            href={`/store/${listingId}/book`}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-[#2D3B45] text-white text-xs font-bold rounded-xl
              hover:bg-[#3a4d5a] active:scale-[0.98] transition-all no-underline">
            <Calendar size={13} />
            Request Booking
          </Link>
        ) : (
          <Link
            href={`/auth/login?redirect=/store/${listingId}`}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-[#2D3B45] text-white text-xs font-bold rounded-xl
              hover:bg-[#3a4d5a] active:scale-[0.98] transition-all no-underline">
            <Calendar size={13} />
            Sign in to Book
          </Link>
        )}

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3
              bg-emerald-500 text-white text-xs font-bold rounded-xl
              hover:bg-emerald-600 active:scale-[0.98] transition-all no-underline">
            <MessageCircle size={13} />
            WhatsApp Vendor
          </a>
        )}

        {vendor?.phoneNumber && (
          <button
            onClick={() => setShowPhone(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3
              border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl
              hover:bg-gray-50 active:scale-[0.98] transition-all">
            <Phone size={13} className="text-gray-400" />
            {showPhone ? vendor.phoneNumber : 'Show phone number'}
          </button>
        )}
      </div>
    </div>
  );
}