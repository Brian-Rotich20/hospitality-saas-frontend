// Search Types for defining the structure of search-related data, such as search parameters
export interface SearchParams {
  q?: string;
  category?: string;
  county?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  capacity?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  search?: string;
sortBy?: string;
}

