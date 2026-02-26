// Listing types for defining the structure of listing-related data, such as properties, amenities, pricing, and availability.
export interface Listing {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string;
  category: 'venue' | 'catering' | 'accommodation' | 'other';
  capacity?: number;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  startingPrice: number;
  currency: string;
  images: string[];
  amenities: string[];
  status: 'draft' | 'published' | 'paused' | 'archived';
  rating: number;
  reviewCount: number;
  availability: {
    available: boolean;
    blockedDates: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  capacity?: number;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'createdAt';
}

