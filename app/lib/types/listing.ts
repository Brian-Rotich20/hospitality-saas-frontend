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
  logo?:           string;
  whatsappNumber?: string;
  phoneNumber?:    string;
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
  price?:      string;
  minPrice?:   string;
  maxPrice?:   string;
  currency:    string;
  photos:      string[];
  coverPhoto?: string;
  status:      ListingStatus;
  views:       number;
  bookingsCount: number;
  createdAt:   string;
  updatedAt:   string;
  vendor?:     ListingVendor;
  category?:   Category;
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

export function resolveListingPrice(listing: Listing): number {
  const p = listing.price ?? listing.minPrice;
  return p ? parseFloat(p) : 0;
}