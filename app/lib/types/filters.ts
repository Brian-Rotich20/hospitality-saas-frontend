export type SortBy = 'rating' | 'price-low' | 'price-high' | 'newest';

export interface ListingFilters {
  search: string;
  category: string;
  city: string;
  priceMin: string;
  priceMax: string;
  capacity: string;
}