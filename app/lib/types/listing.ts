// lib/types/index.ts  — Listing interface, aligned with backend Drizzle schema

export interface Listing {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string;
  category: 'event_venue' | 'catering' | 'accommodation' | 'other';
  capacity?: number;

  // ✅ Flat fields — backend does NOT nest these in a location object
  location: string;     // e.g. "Nairobi"
  address: string;
  city: string;
  county?: string;
  latitude?: string;
  longitude?: string;

  basePrice: number;    // ✅ backend field name — NOT startingPrice
  currency: string;     // e.g. "KES"

  photos: string[];
  coverPhoto?: string;
  amenities: string[];

  // ✅ Backend enum: 'draft' | 'active' | 'paused' | 'deleted'
  //    'active' = live/published. 'published' does NOT exist in backend.
  status: 'draft' | 'active' | 'paused' | 'deleted';

  views: number;
  bookingsCount: number;
  rating?: number;
  reviewCount?: number;

  instantBooking: boolean;
  minBookingDuration: number;
  maxBookingDuration: number;
  leadTime: number;

  createdAt: string;
  updatedAt: string;

  vendor?: {
    id: string;
    businessName: string;
    businessType: string;
    location: string;
    phoneNumber?: string;
  };
}

export interface ListingFilters {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
}