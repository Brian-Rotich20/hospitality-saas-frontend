// components/listings/BookingCard.tsx
'use client';

import { useState }  from 'react';
import Link          from 'next/link';
import { useAuth }   from '../../lib/auth/auth.context';
import { Calendar, Phone, MessageCircle, Users, MapPin, Zap, Clock } from 'lucide-react';

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
  const whatsapp  = vendor?.whatsappNumber ?? vendor?.phoneNumber;

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in your listing on LinkMart. Can you share more details?`
      )}`
    : null;

  const locationStr = [location.area, location.county].filter(Boolean).join(', ');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-20">

      {/* ── Price header ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-50">
        {isContact ? (
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pricing</p>
            <p className="text-lg font-black text-gray-900">Contact for price</p>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-gray-400">{currency}</span>
                <span className="text-3xl font-black text-[#2D3B45] tracking-tight leading-none">
                  {price.toLocaleString()}
                </span>
                {suffix && (
                  <span className="text-xs font-medium text-gray-400 mb-0.5">{suffix}</span>
                )}
              </div>
            </div>
            {instantBooking && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold
                text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                <Zap size={9} fill="currentColor" />
                Instant
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Quick facts ──────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-gray-50 space-y-2.5">
        {capacity && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users size={12} className="text-gray-400" />
              Capacity
            </div>
            <span className="text-xs font-bold text-gray-800">{Number(capacity).toLocaleString()} guests</span>
          </div>
        )}
        {locationStr && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className="text-gray-400" />
              Location
            </div>
            <span className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{locationStr}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} className="text-gray-400" />
            Booking
          </div>
          <span className={`text-xs font-bold ${instantBooking ? 'text-emerald-600' : 'text-amber-600'}`}>
            {instantBooking ? 'Instant confirm' : 'Awaits approval'}
          </span>
        </div>
      </div>

      {/* ── CTAs ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-2">
        {isAuthenticated ? (
          <Link href={`/store/${listingId}/book`}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-[#2D3B45] text-white text-sm font-black rounded-xl
              hover:bg-[#3a4d5a] active:scale-[0.98] transition-all no-underline">
            <Calendar size={14} />
            Request Booking
          </Link>
        ) : (
          <Link href={`/auth/login?redirect=/store/${listingId}`}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-[#2D3B45] text-white text-sm font-black rounded-xl
              hover:bg-[#3a4d5a] active:scale-[0.98] transition-all no-underline">
            <Calendar size={14} />
            Sign in to Book
          </Link>
        )}

        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3
              bg-[#25D366] text-white text-sm font-bold rounded-xl
              hover:bg-[#1fbd5a] active:scale-[0.98] transition-all no-underline">
            <MessageCircle size={14} />
            Chat on WhatsApp
          </a>
        )}

        {vendor?.phoneNumber && (
          <button onClick={() => setShowPhone(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3
              border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl
              hover:bg-gray-50 active:scale-[0.98] transition-all">
            <Phone size={13} className="text-gray-400" />
            {showPhone ? vendor.phoneNumber : 'Show phone number'}
          </button>
        )}
      </div>

      {/* ── Bottom note ──────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-center text-gray-400 leading-relaxed">
          You won't be charged until the vendor confirms your booking
        </p>
      </div>
    </div>
  );
}