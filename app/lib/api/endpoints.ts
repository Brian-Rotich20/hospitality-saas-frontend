// API route constants
// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // Listings
  LISTINGS: {
    GET_ALL: '/listings',
    GET_FEATURED: '/listings/featured',
    GET_BY_ID: (id: string) => `/listings/${id}`,
    GET_BY_SLUG: (slug: string) => `/listings/slug/${slug}`,
    CREATE: '/listings',
    UPDATE: (id: string) => `/listings/${id}`,
    DELETE: (id: string) => `/listings/${id}`,
    GET_MY_LISTINGS: '/listings/me/listings',
    UPDATE_STATUS: (id: string) => `/listings/${id}/status`,
  },

  // Availability
  AVAILABILITY: {
    GET: (listingId: string) => `/listings/${listingId}/availability`,
    GET_CALENDAR: (listingId: string) => `/listings/${listingId}/calendar`,
    BLOCK_DATES: (listingId: string) => `/listings/${listingId}/block`,
    UNBLOCK_DATES: (listingId: string) => `/listings/${listingId}/unblock`,
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    GET_MY_BOOKINGS: '/bookings/me',
    GET_VENDOR_BOOKINGS: '/bookings/vendor',
    GET_PENDING_BOOKINGS: '/bookings/vendor/pending',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    ACCEPT: (id: string) => `/bookings/${id}/accept`,
    DECLINE: (id: string) => `/bookings/${id}/decline`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },

  // Vendors
  VENDORS: {
    APPLY: '/vendors/apply',
    GET_PROFILE: '/vendors/me',
    UPDATE_PROFILE: '/vendors/me',
    ADD_PAYOUT_DETAILS: '/vendors/me/payout-details',
    UPLOAD_DOCUMENTS: '/vendors/me/documents',
    GET_EARNINGS: '/vendors/me/earnings',
  },

  // Admin - Vendors
  ADMIN_VENDORS: {
    GET_PENDING: '/admin/vendors/pending',
    GET_ALL: '/admin/vendors',
    GET_BY_ID: (id: string) => `/admin/vendors/${id}`,
    REVIEW: (id: string) => `/admin/vendors/${id}/review`,
    SUSPEND: (id: string) => `/admin/vendors/${id}/suspend`,
  },

  // Admin - Bookings
  ADMIN_BOOKINGS: {
    GET_ALL: '/admin/bookings',
  },

  // Upload
  UPLOAD: {
    SINGLE_IMAGE: '/upload/image',
    MULTIPLE_IMAGES: '/upload/images',
    DOCUMENT: '/upload/document',
    DELETE: '/upload/file',
  },
};

// API Service Methods
import { apiClient } from './client';
import {
  Listing,
  Booking,
  Vendor,
  PaginatedResponse,
  ApiResponse,
  CreateBookingRequest,
  SearchParams,
  VendorApplication,
} from '../types/index';

// ============ Auth Services ============
export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; refreshToken?: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    ),

  register: (data: any) =>
    apiClient.post<{ token: string; refreshToken?: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    ),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    ),

  verifyOtp: (phoneNumber: string, otp: string) =>
    apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { phoneNumber, otp }
    ),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    ),
};

// ============ Listings Services ============
export const listingsService = {
  getAll: (filters?: SearchParams) =>
    apiClient.get<PaginatedResponse<Listing>>(
      API_ENDPOINTS.LISTINGS.GET_ALL,
      { params: filters }
    ),

  getFeatured: () =>
    apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_FEATURED),

  getById: (id: string) =>
    apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_ID(id)),

  getBySlug: (slug: string) =>
    apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_SLUG(slug)),

  create: (data: any) =>
    apiClient.post<Listing>(API_ENDPOINTS.LISTINGS.CREATE, data),

  update: (id: string, data: any) =>
    apiClient.put<Listing>(API_ENDPOINTS.LISTINGS.UPDATE(id), data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(API_ENDPOINTS.LISTINGS.DELETE(id)),

  getMyListings: () =>
    apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_MY_LISTINGS),

  updateStatus: (id: string, status: 'published' | 'paused') =>
    apiClient.put<Listing>(API_ENDPOINTS.LISTINGS.UPDATE_STATUS(id), {
      status,
    }),
};

// ============ Availability Services ============
export const availabilityService = {
  getAvailability: (listingId: string, startDate?: string, endDate?: string) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET(listingId), {
      params: { startDate, endDate },
    }),

  getCalendar: (listingId: string, year: number, month: number) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET_CALENDAR(listingId), {
      params: { year, month },
    }),

  blockDates: (listingId: string, startDate: string, endDate: string) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.BLOCK_DATES(listingId), {
      startDate,
      endDate,
    }),

  unblockDates: (listingId: string, startDate: string, endDate: string) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.UNBLOCK_DATES(listingId), {
      startDate,
      endDate,
    }),
};

// ============ Bookings Services ============
export const bookingsService = {
  create: (data: CreateBookingRequest) =>
    apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CREATE, data),

  getMyBookings: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.BOOKINGS.GET_MY_BOOKINGS,
      { params: { page, limit } }
    ),

  getVendorBookings: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.BOOKINGS.GET_VENDOR_BOOKINGS,
      { params: { page, limit } }
    ),

  getPendingBookings: () =>
    apiClient.get<Booking[]>(API_ENDPOINTS.BOOKINGS.GET_PENDING_BOOKINGS),

  getById: (id: string) =>
    apiClient.get<Booking>(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id)),

  accept: (id: string) =>
    apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.ACCEPT(id), {}),

  decline: (id: string, reason?: string) =>
    apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.DECLINE(id), { reason }),

  cancel: (id: string, reason?: string) =>
    apiClient.put<Booking>(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
};

// ============ Vendors Services ============
export const vendorsService = {
  apply: (data: VendorApplication) =>
    apiClient.post<Vendor>(API_ENDPOINTS.VENDORS.APPLY, data),

  getProfile: () =>
    apiClient.get<Vendor>(API_ENDPOINTS.VENDORS.GET_PROFILE),

  updateProfile: (data: any) =>
    apiClient.put<Vendor>(API_ENDPOINTS.VENDORS.UPDATE_PROFILE, data),

  addPayoutDetails: (data: any) =>
    apiClient.post(API_ENDPOINTS.VENDORS.ADD_PAYOUT_DETAILS, data),

  uploadDocuments: (files: File[]) =>
    apiClient.uploadMultipleFiles(API_ENDPOINTS.VENDORS.UPLOAD_DOCUMENTS, files),

  getEarnings: () =>
    apiClient.get(API_ENDPOINTS.VENDORS.GET_EARNINGS),
};

// ============ Admin Services ============
export const adminService = {
  getPendingVendors: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Vendor>>(
      API_ENDPOINTS.ADMIN_VENDORS.GET_PENDING,
      { params: { page, limit } }
    ),

  getAllVendors: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Vendor>>(
      API_ENDPOINTS.ADMIN_VENDORS.GET_ALL,
      { params: { page, limit } }
    ),

  getVendorById: (id: string) =>
    apiClient.get<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.GET_BY_ID(id)),

  reviewVendor: (
    id: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) =>
    apiClient.put<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.REVIEW(id), {
      status,
      reason,
    }),

  suspendVendor: (id: string, reason?: string) =>
    apiClient.put<Vendor>(API_ENDPOINTS.ADMIN_VENDORS.SUSPEND(id), { reason }),

  getAllBookings: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Booking>>(
      API_ENDPOINTS.ADMIN_BOOKINGS.GET_ALL,
      { params: { page, limit } }
    ),
};

// ============ Upload Services ============
export const uploadService = {
  uploadImage: (file: File) =>
    apiClient.uploadFile<{ url: string }>(
      API_ENDPOINTS.UPLOAD.SINGLE_IMAGE,
      file
    ),

  uploadImages: (files: File[]) =>
    apiClient.uploadMultipleFiles<{ urls: string[] }>(
      API_ENDPOINTS.UPLOAD.MULTIPLE_IMAGES,
      files
    ),

  uploadDocument: (file: File) =>
    apiClient.uploadFile<{ url: string }>(
      API_ENDPOINTS.UPLOAD.DOCUMENT,
      file
    ),

  deleteFile: (fileUrl: string) =>
    apiClient.post<{ message: string }>(API_ENDPOINTS.UPLOAD.DELETE, {
      url: fileUrl,
    }),
};