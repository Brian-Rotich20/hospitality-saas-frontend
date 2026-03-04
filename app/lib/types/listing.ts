// Listing types - aligned with backend database schema
export interface Listing {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string;
  category: 'event_venue' | 'catering' | 'accommodation' | 'other'; // ✅ matches backend enum
  capacity?: number;

  // ✅ Backend returns these as flat fields, NOT nested object
  location: string;        // flat string e.g. "Nairobi"
  address: string;
  city: string;
  county?: string;
  latitude?: string;
  longitude?: string;
  basePrice: number;
  currency: string;        // e.g. "KES"

  photos: string[];
  coverPhoto?: string;

  amenities: string[];
  status: 'draft' | 'active' | 'paused' | 'deleted'; // ✅ matches backend enum

  // Stats
  views: number;
  bookingsCount: number;
  rating?: number;
  reviewCount?: number;

  // Booking settings
  instantBooking: boolean;
  minBookingDuration: number;
  maxBookingDuration: number;
  leadTime: number;

  createdAt: string;
  updatedAt: string;

  // Optional vendor relation (populated when includeVendor=true)
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
  minPrice?: number;       // ✅ matches backend schema field names
  maxPrice?: number;
  minCapacity?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;    
  }      // e.g. "price", "rating", "createdAt"    