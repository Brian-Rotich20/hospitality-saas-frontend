// lib/types/listing.ts

export type ListingStatus    = 'draft' | 'active' | 'paused' | 'deleted';
export type PricingType      = 'fixed' | 'per_day' | 'per_hour' | 'per_person' | 'range' | 'package';
export type ProductStatus    = 'draft' | 'active' | 'paused' | 'out_of_stock' | 'deleted';

// ── Location jsonb shape (matches backend) ────────────────────────────────────
export interface ListingLocation {
  city:       string;
  address?:   string | undefined;
  county?:    string | undefined;
  country?:   string | undefined;
  latitude?:  number | undefined;
  longitude?: number | undefined;
}

// ── Category (from /api/categories) ──────────────────────────────────────────
export interface Category {
  id:        string;
  name:      string;
  slug:      string;
  icon?:     string | undefined;
  imageUrl?: string | undefined;
  parentId?: string | undefined;
  children?: Category[] | undefined;
}

// ── Vendor shape on relations ─────────────────────────────────────────────────
export interface ListingVendor {
  id:              string;
  businessName:    string;
  slug:            string;
  logo?:           string | undefined;
  whatsappNumber?: string | undefined;
  phoneNumber:     string;
  verified:        boolean;
}

// ── Listing (matches new backend schema) ─────────────────────────────────────
export interface Listing {
  id:          string;
  vendorId:    string;
  categoryId:  string;
  title:       string;
  slug:        string;
  description: string;

  // ✅ jsonb location — NOT flat fields
  location: ListingLocation;

  capacity?: number | undefined;

  // ✅ Flexible pricing
  pricingType: PricingType;
  price?:      string | undefined;   // decimal string from DB
  minPrice?:   string | undefined;
  maxPrice?:   string | undefined;
  currency:    string;

  photos:     string[];
  coverPhoto?: string | undefined;
  amenities?:  string[] | undefined;

  instantBooking:     boolean;
  minBookingDuration: number;
  maxBookingDuration: number;
  leadTime:           number;

  status:        ListingStatus;
  views:         number;
  bookingsCount: number;

  createdAt: string;
  updatedAt: string;

  // Relations (when fetched with includeRelations)
  vendor?:   ListingVendor  | undefined;
  category?: Category       | undefined;
}

// ── Product variant ───────────────────────────────────────────────────────────
export interface ProductVariant {
  id:          string;
  productId:   string;
  name:        string;
  price?:      string | undefined;
  attributes?: Record<string, string> | undefined;
}

// ── Product inventory ─────────────────────────────────────────────────────────
export interface ProductInventory {
  id:         string;
  productId:  string;
  quantity:   number;
  lowStockAt: number;
  trackStock: boolean;
  updatedAt:  string;
}

// ── Product (marketplace side) ────────────────────────────────────────────────
export interface Product {
  id:          string;
  vendorId:    string;
  categoryId?: string | undefined;
  title:       string;
  slug:        string;
  description?: string | undefined;
  price:       string;   // decimal string
  currency:    string;
  photos:      string[];
  coverPhoto?: string | undefined;
  whatsappMessage?: string | undefined;
  isDigital:   boolean;
  status:      ProductStatus;
  views:       number;
  createdAt:   string;
  updatedAt:   string;

  vendor?:    ListingVendor  | undefined;
  category?:  Category       | undefined;
  variants?:  ProductVariant[]  | undefined;
  inventory?: ProductInventory[] | undefined;
}

// ── Filters ───────────────────────────────────────────────────────────────────
export interface ListingFilters {
  categoryId?:   string | undefined;
  categorySlug?: string | undefined;
  search?:       string | undefined;
  city?:         string | undefined;
  minPrice?:     number | undefined;
  maxPrice?:     number | undefined;
  minCapacity?:  number | undefined;
  sortBy?:       'price' | 'popular' | 'newest' | undefined;
  limit?:        number | undefined;
  offset?:       number | undefined;
}

export interface ProductFilters {
  categoryId?:   string  | undefined;
  categorySlug?: string  | undefined;
  vendorId?:     string  | undefined;
  search?:       string  | undefined;
  minPrice?:     number  | undefined;
  maxPrice?:     number  | undefined;
  isDigital?:    boolean | undefined;
  sortBy?:       'price' | 'newest' | 'popular' | undefined;
  limit?:        number  | undefined;
  offset?:       number  | undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Resolve display price from listing (handles all pricingTypes)
export function resolveListingPrice(listing: Listing): number {
  const p = listing.price ?? listing.minPrice;
  return p ? parseFloat(p) : 0;
}

export function resolveProductPrice(product: Product): number {
  return parseFloat(product.price ?? '0');
}