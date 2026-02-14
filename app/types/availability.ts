// Availability types for defining the structure of availability-related data, such as available dates, time slots, and booking status.
export interface Availability {
  listingId: string;
  date: string;
  available: boolean;
  priceOverride?: number;
}

export interface BlockedDate {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}
