export type ListingStatus = 'draft' | 'active' | 'paused' | 'deleted';
export type PricingType   = 'per_hour' | 'per_day' | 'per_person' | 'package' | 'contact';

// ── Location — county + area only (no city, no address)
export interface ListingLocation {
  county:     string;
  area:       string;
  country?:   string;
  latitude?:  number | undefined;
  longitude?: number | undefined;
}

// ── Category — supports parent/children tree
export interface Category {
  id:        string;
  name:      string;
  slug:      string;
  icon?:     string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
}

export interface ListingVendor {
  id:              string;
  businessName:    string;
  slug:            string;
  logo?:           string | null;
  whatsappNumber?: string | null;
  phoneNumber?:    string | null;
  verified:        boolean;
}

export interface Listing {
  id:          string;
  vendorId:    string;
  categoryId:  string;
  title:       string;
  slug:        string;
  description: string;

  location:    ListingLocation;
  pricingType: PricingType;
  /** Display prices: exact decimal strings from the API (e.g. "50000.00"), or null. */
  price:       string | null;
  minPrice:    string | null;
  maxPrice:    string | null;
  currency:    string;
  photos:      string[];
  coverPhoto: string | null;
  status:      ListingStatus;
  views:       number;
  bookingsCount: number;
  createdAt:   string;
  updatedAt:   string;
  vendor?:     ListingVendor;
  
  category?:   Category;
  /** Average rating (number, one decimal) or null until the first review. */
  rating:        number | null;
  reviewCount:   number;
  _lat?:       number | undefined
  _lng?:       number | undefined
}

export interface ListingFilters {
  categoryId?:   string;
  categorySlug?: string;
  county?:       string;
  area?:         string;
  search?:       string;
  minPrice?:     number;
  maxPrice?:     number;
  sortBy?:       'price' | 'popular' | 'newest';
  limit?:        number;
  offset?:       number;
}

/** Numeric display price from the API's decimal strings; 0 when none is set or unparsable. */
export function resolveListingPrice(listing: Pick<Listing, 'price' | 'minPrice'>): number {
  const p = listing.price ?? listing.minPrice;
  const n = p ? Number(p) : 0;
  return Number.isFinite(n) ? n : 0;
}