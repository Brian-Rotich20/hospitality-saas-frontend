// components/listings/BookingCard.tsx
// ✅ Client Component — contact/WhatsApp action, sticky sidebar card
'use client';

import { useState }           from 'react';
import Link                   from 'next/link';
import { useAuth }            from '../../lib/auth/auth.context';
import { Calendar, Phone, MessageCircle } from 'lucide-react';

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
}

interface Props {
  listingId:     string;
  price:         number;
  pricingType:   string;
  currency:      string;
  capacity?:     number;
  location:      Location;
  instantBooking?: boolean;
  vendor?:       Vendor;
}

export function BookingCard({
  listingId, price, pricingType, currency,
  capacity, location, instantBooking, vendor,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [showPhone, setShowPhone] = useState(false);

  const suffix     = PRICING_SUFFIX[pricingType] ?? '';
  const isContact  = pricingType === 'contact';
  const isPackage  = pricingType === 'package';
  const whatsapp   = vendor?.whatsappNumber ?? vendor?.phoneNumber;

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in booking your listing on LinkMart. Can you share more details?`
      )}`
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:sticky lg:top-20">

      {/* Price */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {isContact ? 'Pricing' : isPackage ? 'Starting from' : 'Price'}
        </p>
        {isContact ? (
          <p className="text-lg font-black text-[#2D3B45]">Contact for price</p>
        ) : (
          <p className="text-2xl font-black text-[#2D3B45] leading-none">
            <span className="text-sm font-semibold text-gray-400 mr-1">{currency}</span>
            {price.toLocaleString()}
            {suffix && <span className="text-xs font-medium text-gray-400 ml-1">{suffix}</span>}
          </p>
        )}
      </div>

      <div className="h-px bg-gray-100 mb-4" />

      {/* Quick stats */}
      <div className="space-y-2.5 mb-4">
        {capacity && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Capacity</span>
            <span className="text-xs font-bold text-gray-800">
              {Number(capacity).toLocaleString()} guests
            </span>
          </div>
        )}
        {location.county && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Location</span>
            <span className="text-xs font-bold text-gray-800">{location.county}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Booking</span>
          <span className={`text-xs font-bold ${instantBooking ? 'text-emerald-600' : 'text-amber-600'}`}>
            {instantBooking ? 'Instant' : 'Request approval'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Currency</span>
          <span className="text-xs font-bold text-gray-800">{currency}</span>
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-4" />

      {/* CTAs */}
      <div className="space-y-2">
        {/* Request Booking — requires auth */}
        {isAuthenticated ? (
          <Link href={`/store/${listingId}/book`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors no-underline">
            <Calendar size={14} /> Request Booking
          </Link>
        ) : (
          <Link href={`/auth/login?redirect=/store/${listingId}`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D3B45] text-white
              text-xs font-bold rounded-xl hover:bg-[#3a4d5a] transition-colors no-underline">
            <Calendar size={14} /> Sign in to Book
          </Link>
        )}

        {/* WhatsApp */}
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500
              text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors no-underline">
            <MessageCircle size={14} /> WhatsApp Vendor
          </a>
        )}

        {/* Phone reveal */}
        {vendor?.phoneNumber && (
          <button
            onClick={() => setShowPhone(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200
              text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <Phone size={14} className="text-gray-400" />
            {showPhone ? vendor.phoneNumber : 'Show phone number'}
          </button>
        )}
      </div>
    </div>
  );
}