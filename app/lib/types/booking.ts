import { Listing } from "./listing";

// Booking types
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  customerId: string;
  vendorId: string;
  listingId: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  totalPrice: number;
  currency: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
}

export interface CreateBookingRequest {
  listingId: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  notes?: string;
}