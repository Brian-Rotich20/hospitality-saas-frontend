// Booking types, matching the backend contract (docs/api/API-REFERENCE.md §7).
// Request-to-book: bookings carry no money. Payment is arranged between customer and vendor.

export type BookingStatus = 'requested' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'completed';
export type BookingActor = 'customer' | 'vendor' | 'system' | 'admin';

/** Contact fields appear only after the vendor accepts (and only to the other party). */
export interface BookingCustomer { id: string; fullName: string | null; email?: string; phone?: string | null }
export interface BookingVendor   { id: string; businessName: string; slug?: string; logo?: string | null; phoneNumber?: string | null }

/** Full booking view: GET /bookings/:id, and the response of create/accept/decline/cancel. */
export interface Booking {
  id: string;
  status: BookingStatus;
  /** Calendar dates (YYYY-MM-DD, inclusive). */
  startDate: string;
  endDate: string;
  guests: number;
  specialRequests: string | null;
  pricingType: string;
  currency: string;
  /** The vendor's 24-hour deadline; only set while `requested`. */
  respondBy: string | null;
  declineReason: string | null;
  cancellationReason: string | null;
  cancelledBy: BookingActor | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  listing: { id: string; title: string; slug: string; coverPhoto: string | null; location: { county?: string; area?: string } | null } | null;
  customer: BookingCustomer | null;
  vendor: BookingVendor | null;
  paymentNote: string;
}

/** List item: GET /bookings/me (has `vendor`) and /bookings/vendor[/pending] (has `customer`). */
export interface BookingSummary {
  id: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  guests: number;
  respondBy: string | null;
  createdAt: string;
  listing: { id: string; title: string; coverPhoto: string | null; slug: string };
  customer?: BookingCustomer;
  vendor?: BookingVendor;
}

export interface BookingEvent {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  actor: BookingActor;
  reason: string | null;
  createdAt: string;
}

export interface CreateBookingRequest {
  listingId: string;
  startDate: string;
  endDate: string;
  guests: number;
  specialRequests?: string;
}

export interface BookingListFilters {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}
