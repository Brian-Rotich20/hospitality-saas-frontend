// lib/api/endpoints.ts
import { Customer, CustomerFilters } from '../types/customer';

export const API_ENDPOINTS = {

  LISTINGS: {
    GET_ALL:         '/listings',
    GET_FEATURED:    '/listings/featured',
    GET_BY_ID:       (id: string)   => `/listings/${id}`,
    GET_BY_SLUG:     (slug: string) => `/listings/slug/${slug}`,
    CREATE:          '/listings',
    UPDATE:          (id: string)   => `/listings/${id}`,
    DELETE:          (id: string)   => `/listings/${id}`,
    UPDATE_STATUS:   (id: string)   => `/listings/${id}/status`,
    MY_LISTINGS:     '/listings/me',
  },

  
  CATEGORIES: {
    GET_ALL:         '/categories',
    GET_TREE:        '/categories/tree',
    GET_BY_ID:       (id: string)   => `/categories/${id}`,
    GET_BY_SLUG:     (slug: string) => `/categories/slug/${slug}`,
    GET_CHILDREN:    (id: string)   => `/categories/${id}/subcategories`,
  },

  AVAILABILITY: {
    GET:             (listingId: string) => `/listings/${listingId}/availability`,
    GET_CALENDAR:    (listingId: string) => `/listings/${listingId}/calendar`,
    BLOCK_DATES:     (listingId: string) => `/listings/${listingId}/block`,
    UNBLOCK_DATES:   (listingId: string) => `/listings/${listingId}/unblock`,
  },

  BOOKINGS: {
    CREATE:          '/bookings',
    MY_BOOKINGS:     '/bookings/me',
    VENDOR_BOOKINGS: '/bookings/vendor',
    PENDING:         '/bookings/vendor/pending',
    GET_BY_ID:       (id: string) => `/bookings/${id}`,
    EVENTS:          (id: string) => `/bookings/${id}/events`,
    ACCEPT:          (id: string) => `/bookings/${id}/accept`,
    DECLINE:         (id: string) => `/bookings/${id}/decline`,
    CANCEL:          (id: string) => `/bookings/${id}/cancel`,
  },

  // ── Vendors — no application/OTP step; a vendor row is created instantly
  // via BECOME, then the onboarding page lets them customize it (skippable).
  VENDORS: {
    BECOME:          '/vendors/become',
    MY_PROFILE:      '/vendors/me',
    UPDATE_PROFILE:  '/vendors/me',
    PAYOUT_DETAILS:  '/vendors/me/payout-details',
    PUBLIC_PROFILE:  (id: string) => `/vendors/${id}`,
  },

  ADMIN_VENDORS: {
    GET_ALL:   '/admin/vendors',
    GET_BY_ID: (id: string) => `/admin/vendors/${id}`,
    SUSPEND:   (id: string) => `/admin/vendors/${id}/suspend`,
    REINSTATE: (id: string) => `/admin/vendors/${id}/reinstate`,
  },

  ADMIN_CUSTOMERS: {
    GET_ALL: '/admin/customers',
  },

  ADMIN_BOOKINGS: {
    GET_ALL: '/admin/bookings',
  },

  UPLOAD: {
    SINGLE_IMAGE:    '/upload/image',
    MULTIPLE_IMAGES: '/upload/images',
    DELETE:          '/upload/file',
  },

  REVIEWS: {
    CREATE:           '/reviews',
    LIST_FOR_LISTING: (listingId: string) => `/reviews/listing/${listingId}`,
    ELIGIBILITY:      (listingId: string) => `/reviews/eligibility/${listingId}`,
    REPLY:            (reviewId: string)  => `/reviews/${reviewId}/reply`,
  },

  CUSTOMER: {
    PROFILE:      '/users/me',
    UPDATE:       '/users/me',
    STATS:        '/users/me/stats',
    SAVED:        '/users/me/saved',
    TOGGLE_SAVED: (listingId: string) => `/users/me/saved/${listingId}`,
    IS_SAVED:     (listingId: string) => `/users/me/saved/${listingId}`,
  },
};

// ── Service methods ───────────────────────────────────────────────────────────
import { apiClient } from './client';
import type { Listing, Category, ListingFilters } from '../types/listing';
import type { Vendor, UpdateVendorInput, PayoutDetailsInput } from '../types/vendor';
import type { Booking, BookingEvent, BookingListFilters, BookingSummary, CreateBookingRequest } from '../types/booking';
import type { ConversationRef, ConversationSummary, MessagePage, MessageReport } from '../types/messaging';
import type {
  AdminPaymentRow, AdminSubscriptionRow, AdminVendorBilling, Invoice, PaymentAttempt, PaymentHistoryRow,
  PaymentMethods, Plan, RevenueRow, SubscriptionOverview,
} from '../types/subscription';

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesService = {
  getAll:      () => apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_ALL),
  getTree:     () => apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_TREE),
  getBySlug:   (slug: string) => apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)),
  getChildren: (id: string)   => apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_CHILDREN(id)),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingsService = {
  getAll:        (filters?: ListingFilters) => apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_ALL, { params: filters }),
  getFeatured:   () => apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_FEATURED),
  getById:       (id: string)   => apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_ID(id)),
  getBySlug:     (slug: string) => apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_SLUG(slug)),
  getMyListings: () => apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.MY_LISTINGS),
  create:        (data: any) => apiClient.post<Listing>(API_ENDPOINTS.LISTINGS.CREATE, data),
  update:        (id: string, data: any) => apiClient.put<Listing>(API_ENDPOINTS.LISTINGS.UPDATE(id), data),
  updateStatus:  (id: string, status: 'active' | 'paused') =>
    apiClient.patch<Listing>(API_ENDPOINTS.LISTINGS.UPDATE_STATUS(id), { status }),
  delete:        (id: string) => apiClient.delete<{ message: string }>(API_ENDPOINTS.LISTINGS.DELETE(id)),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsService = {
  create:            (data: CreateBookingRequest) => apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CREATE, data),
  getMyBookings:     (filters?: BookingListFilters) => apiClient.get<BookingSummary[]>(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, { params: filters }),
  getVendorBookings: (filters?: BookingListFilters) => apiClient.get<BookingSummary[]>(API_ENDPOINTS.BOOKINGS.VENDOR_BOOKINGS, { params: filters }),
  getPending:        () => apiClient.get<BookingSummary[]>(API_ENDPOINTS.BOOKINGS.PENDING),
  getById:           (id: string) => apiClient.get<Booking>(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id)),
  getEvents:         (id: string) => apiClient.get<BookingEvent[]>(API_ENDPOINTS.BOOKINGS.EVENTS(id)),
  // The backend uses PUT for every booking transition.
  accept:            (id: string) => apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.ACCEPT(id), {}),
  decline:           (id: string, reason: string) => apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.DECLINE(id), { reason }),
  cancel:            (id: string, reason: string) => apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
};

export const availabilityService = {
  get:          (listingId: string, startDate: string, endDate: string) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET(listingId), { params: { startDate, endDate } }),
  getCalendar:  (listingId: string, startDate: string, endDate: string) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET_CALENDAR(listingId), { params: { startDate, endDate } }),
  blockDates:   (listingId: string, dates: string[], reason?: string) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.BLOCK_DATES(listingId), { dates, reason }),
  unblockDates: (listingId: string, dates: string[]) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.UNBLOCK_DATES(listingId), { dates }),
};

// ── Vendors ───────────────────────────────────────────────────────────────────
export const vendorsService = {
  // Instant, idempotent — no body needed. Backend pre-fills businessName/phone
  // from the user's own account.
  become: () => apiClient.post<Vendor>(API_ENDPOINTS.VENDORS.BECOME, {}),

  getProfile: () => apiClient.get<Vendor>(API_ENDPOINTS.VENDORS.MY_PROFILE),

  updateProfile: (data: UpdateVendorInput) =>
    apiClient.put<Vendor>(API_ENDPOINTS.VENDORS.UPDATE_PROFILE, data),

  addPayoutDetails: (data: PayoutDetailsInput) =>
    apiClient.post<Vendor>(API_ENDPOINTS.VENDORS.PAYOUT_DETAILS, data),

  getPublicProfile: (id: string) =>
    apiClient.get<Vendor>(API_ENDPOINTS.VENDORS.PUBLIC_PROFILE(id)),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminService = {
  getAllVendors: (filters?: any) =>
    apiClient.get<Vendor[]>(API_ENDPOINTS.ADMIN_VENDORS.GET_ALL, { params: filters }),

  getVendorById: (id: string) =>
    apiClient.get<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.GET_BY_ID(id)),

  // The reason is optional (5–500 chars when given) and recorded in the audit log.
  suspendVendor: (id: string, reason?: string) =>
    apiClient.put<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.SUSPEND(id), reason ? { reason } : {}),

  reinstateVendor: (id: string, reason?: string) =>
    apiClient.put<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.REINSTATE(id), reason ? { reason } : {}),

  getAllBookings: (filters?: BookingListFilters) =>
    apiClient.get(API_ENDPOINTS.ADMIN_BOOKINGS.GET_ALL, { params: filters }),

  getAllCustomers: (filters?: CustomerFilters) =>
    apiClient.get<Customer[]>(API_ENDPOINTS.ADMIN_CUSTOMERS.GET_ALL, { params: filters }),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export type UploadType = 'listing_photo' | 'vendor_logo' | 'profile_photo';
export interface UploadedImage { id: string; url: string; publicId: string; bytes: number; mimeType: string; width: number; height: number }

export const uploadService = {
  // uploadType is sent before the file (required by the backend).
  uploadImage: (file: File, uploadType: UploadType = 'listing_photo') =>
    apiClient.upload<UploadedImage>(API_ENDPOINTS.UPLOAD.SINGLE_IMAGE, file, { uploadType }),
  uploadImages: (files: File[], uploadType: UploadType = 'listing_photo') =>
    apiClient.upload<UploadedImage[]>(API_ENDPOINTS.UPLOAD.MULTIPLE_IMAGES, files, { uploadType }),
  /** Owner (or admin) only. Takes the `publicId` returned by the upload. */
  deleteFile: (publicId: string) =>
    apiClient.delete<null>(API_ENDPOINTS.UPLOAD.DELETE, { data: { publicId } }),
};

// ── Email verification (6-digit code emailed at sign-up) ──────────────────────
export const otpService = {
  verify: (otp: string) => apiClient.post<{ user: unknown }>('/otp/verify-email', { otp }),
  resend: () => apiClient.post<null>('/otp/resend-otp', {}),
};

// ── Password reset (Better Auth endpoints; responses are not the LinkMart envelope) ──
export const passwordService = {
  /** Always resolves with the same body, whether or not the account exists. */
  requestReset: (email: string) => apiClient.post('/auth/request-password-reset', { email }),
  /** Rejects with code INVALID_TOKEN when the token is unknown, used or expired. */
  reset: (token: string, newPassword: string) => apiClient.post('/auth/reset-password', { token, newPassword }),
};

export const reviewsService = {
  create: (data: { bookingId: string; rating: number; title?: string; body: string }) =>
    apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, data),
  getForListing: (listingId: string, limit = 20, offset = 0) =>
    apiClient.get(API_ENDPOINTS.REVIEWS.LIST_FOR_LISTING(listingId), { params: { limit, offset } }),
  getEligibility: (listingId: string) =>
    apiClient.get(API_ENDPOINTS.REVIEWS.ELIGIBILITY(listingId)),
  addReply: (reviewId: string, reply: string) =>
    apiClient.post(API_ENDPOINTS.REVIEWS.REPLY(reviewId), { reply }),
};

// ── Messaging (polling; no websockets) ───────────────────────────────────────
export const messagingService = {
  list:        () => apiClient.get<ConversationSummary[]>('/conversations'),
  byBooking:   (bookingId: string) => apiClient.get<ConversationRef>(`/conversations/by-booking/${bookingId}`),
  messages:    (conversationId: string, after?: string) =>
    apiClient.get<MessagePage>(`/conversations/${conversationId}/messages`, { params: after ? { after, limit: 200 } : { limit: 200 } }),
  send:        (conversationId: string, body: string) =>
    apiClient.post<{ id: string; body: string; createdAt: string; mine: true }>(`/conversations/${conversationId}/messages`, { body }),
  report:      (messageId: string, reason: string) => apiClient.post(`/messages/${messageId}/report`, { reason }),
};

// ── Vendor subscription (the only payments LinkMart processes) ───────────────
export const subscriptionService = {
  paymentMethods: () => apiClient.get<PaymentMethods>('/subscriptions/payment-methods'),
  overview:       () => apiClient.get<SubscriptionOverview>('/subscriptions/me'),
  invoices:       (limit = 24, offset = 0) => apiClient.get<Invoice[]>('/subscriptions/me/invoices', { params: { limit, offset } }),
  payments:       (limit = 24, offset = 0) => apiClient.get<PaymentHistoryRow[]>('/subscriptions/me/payments', { params: { limit, offset } }),
  /** One Idempotency-Key per user action; reuse it when retrying the same action. */
  pay: (input: { provider: 'paystack' } | { provider: 'mpesa'; phone: string }, idempotencyKey: string) =>
    apiClient.post<PaymentAttempt>('/subscriptions/me/payments', input, { headers: { 'Idempotency-Key': idempotencyKey } }),
  payment:        (id: string) => apiClient.get<PaymentAttempt>(`/subscriptions/me/payments/${id}`),
  cancel:         () => apiClient.post('/subscriptions/me/cancel', {}),
  resume:         () => apiClient.post('/subscriptions/me/resume', {}),
  setAutoRenew:   (enabled: boolean) => apiClient.patch<{ autoRenewOptIn: boolean }>('/subscriptions/me/auto-renew', { enabled }),
};

// ── Admin: billing, payments, moderation, operations ─────────────────────────
export const adminBillingService = {
  subscriptions:  (params: { status?: string; limit?: number; offset?: number } = {}) =>
    apiClient.get<AdminSubscriptionRow[]>('/admin/subscriptions', { params }),
  vendorBilling:  (vendorId: string) => apiClient.get<AdminVendorBilling>(`/admin/subscriptions/vendors/${vendorId}`),
  plans:          () => apiClient.get<Plan[]>('/admin/subscriptions/plans'),
  createPlan:     (input: { code: string; name: string; amountMinor: number; currency: 'KES'; activate: boolean }) =>
    apiClient.post<Plan>('/admin/subscriptions/plans', input),
  setPlanActive:  (id: string, active: boolean) => apiClient.patch<Plan>(`/admin/subscriptions/plans/${id}`, { active }),
  unenrolled:     () => apiClient.get<{ id: string; businessName: string; status: string; createdAt: string }[]>('/admin/subscriptions/unenrolled'),
  enrol:          (vendorId: string) => apiClient.post(`/admin/subscriptions/unenrolled/${vendorId}/enrol`, {}),
  revenue:        (from: string, to: string) => apiClient.get<RevenueRow[]>('/admin/subscriptions/revenue', { params: { from, to } }),
  payments:       (params: { status?: string; provider?: string; vendorId?: string; needsReview?: boolean; limit?: number; offset?: number } = {}) =>
    apiClient.get<AdminPaymentRow[]>('/admin/payments', { params }),
  payment:        (id: string) => apiClient.get<Record<string, unknown>>(`/admin/payments/${id}`),
  review:         (id: string, note: string) => apiClient.post(`/admin/payments/${id}/review`, { note }),
  reverify:       (id: string) => apiClient.post(`/admin/payments/${id}/reverify`, {}),
};

export const adminModerationService = {
  reports:  () => apiClient.get<MessageReport[]>('/admin/messages/reports'),
  moderate: (messageId: string, action: 'hide' | 'dismiss') => apiClient.post(`/admin/messages/${messageId}/moderate`, { action }),
};

export const adminOperationsService = {
  health: () => apiClient.get<Record<string, unknown>>('/admin/operations/health'),
};

export const customerService = {
  getProfile:    () => apiClient.get(API_ENDPOINTS.CUSTOMER.PROFILE),
  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    apiClient.patch(API_ENDPOINTS.CUSTOMER.UPDATE, data),
  getStats:      () => apiClient.get(API_ENDPOINTS.CUSTOMER.STATS),
  getSaved:      () => apiClient.get(API_ENDPOINTS.CUSTOMER.SAVED),
  toggleSaved:   (listingId: string) => apiClient.post(API_ENDPOINTS.CUSTOMER.TOGGLE_SAVED(listingId), {}),
  isSaved:       (listingId: string) => apiClient.get(API_ENDPOINTS.CUSTOMER.IS_SAVED(listingId)),
};