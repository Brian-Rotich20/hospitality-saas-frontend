// App constants for global use across the application
export const APP_NAME = 'Venues & Catering';
export const APP_DESCRIPTION = "Kenya's Premier Hospitality Marketplace";

export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const LISTING_CATEGORIES = [
  { value: 'venue', label: 'Event Venues' },
  { value: 'catering', label: 'Catering Services' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'other', label: 'Other Services' },
];

export const LISTING_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const;

export const PAGINATION_LIMITS = {
  DEFAULT: 10,
  LISTINGS: 12,
  BOOKINGS: 10,
  ADMIN: 25,
};

export const CURRENCY = {
  CODE: 'KES',
  SYMBOL: 'KSh',
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  SHORT: 'dd/MM/yyyy',
};