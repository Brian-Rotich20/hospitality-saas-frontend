// lib/api/endpoints.ts

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:           '/auth/login',
    REGISTER:        '/auth/register',
    LOGOUT:          '/auth/logout',
    LOGOUT_ALL:      '/auth/logout-all',
    REFRESH:         '/auth/refresh',         
    ME:              '/auth/me',
  },

  LISTINGS: {
    GET_ALL:         '/listings',
    GET_FEATURED:    '/listings/featured',
    GET_BY_ID:       (id: string)   => `/listings/${id}`,
    GET_BY_SLUG:     (slug: string) => `/listings/slug/${slug}`,
    CREATE:          '/listings',
    UPDATE:          (id: string)   => `/listings/${id}`,
    DELETE:          (id: string)   => `/listings/${id}`,
    UPDATE_STATUS:   (id: string)   => `/listings/${id}/status`,
    MY_LISTINGS:     '/me',
  },

  // ✅ New — dynamic categories from DB
  CATEGORIES: {
    GET_ALL:         '/categories',
    GET_TREE:        '/categories/tree',
    GET_BY_ID:       (id: string)   => `/categories/${id}`,
    GET_BY_SLUG:     (slug: string) => `/categories/slug/${slug}`,
    GET_CHILDREN:    (id: string)   => `/categories/${id}/subcategories`,
  },

  // ✅ New — products marketplace
  PRODUCTS: {
    GET_ALL:         '/products',
    GET_FEATURED:    '/products/featured',
    GET_BY_ID:       (id: string)   => `/products/${id}`,
    GET_BY_SLUG:     (slug: string) => `/products/slug/${slug}`,
    GET_BY_VENDOR:   (id: string)   => `/products/vendor/${id}`,
    MY_PRODUCTS:     '/products/me',
    CREATE:          '/products',
    UPDATE:          (id: string)   => `/products/${id}`,
    UPDATE_STATUS:   (id: string)   => `/products/${id}/status`,
    UPDATE_INVENTORY:(id: string)   => `/products/${id}/inventory`,
    DELETE:          (id: string)   => `/products/${id}`,
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
    ACCEPT:          (id: string) => `/bookings/${id}/accept`,
    DECLINE:         (id: string) => `/bookings/${id}/decline`,
    CANCEL:          (id: string) => `/bookings/${id}/cancel`,
  },

  VENDORS: {
    APPLY:           '/vendors/apply',
    MY_PROFILE:      '/vendors/me',
    UPDATE_PROFILE:  '/vendors/me',
    PAYOUT_DETAILS:  '/vendors/me/payout-details',
    DOCUMENTS:       '/vendors/me/documents',
    PUBLIC_PROFILE:  (id: string) => `/vendors/${id}`,
  },

  ADMIN_VENDORS: {
    PENDING:         '/admin/vendors/pending',
    GET_ALL:         '/admin/vendors',
    GET_BY_ID:       (id: string) => `/admin/vendors/${id}`,
    REVIEW:          (id: string) => `/admin/vendors/${id}/review`,
    SUSPEND:         (id: string) => `/admin/vendors/${id}/suspend`,
  },

  ADMIN_BOOKINGS: {
    GET_ALL:         '/admin/bookings',
  },

  UPLOAD: {
    SINGLE_IMAGE:    '/upload/image',
    MULTIPLE_IMAGES: '/upload/images',
    DOCUMENT:        '/upload/document',
    DELETE:          '/upload/file',
  },
};

// ── Service methods ───────────────────────────────────────────────────────────
import { apiClient } from './client';
import type {
  Listing, Product, Category,
  ListingFilters, ProductFilters,
} from '../types/listing';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:        (email: string, password: string) =>
    apiClient.post<{ user: any; accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  register:     (data: any) =>
    apiClient.post<{ user: any; accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.REGISTER, data),

  refresh:      () =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH, {}),

  logout:       () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}),

  me:           () =>
    apiClient.get<any>(API_ENDPOINTS.AUTH.ME),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesService = {
  getAll:       () =>
    apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_ALL),

  getTree:      () =>
    apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_TREE),

  getBySlug:    (slug: string) =>
    apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)),

  getChildren:  (id: string) =>
    apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.GET_CHILDREN(id)),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export const listingsService = {
  getAll:       (filters?: ListingFilters) =>
    apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_ALL, { params: filters }),

  getFeatured:  () =>
    apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.GET_FEATURED),

  getById:      (id: string) =>
    apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_ID(id)),

  getBySlug:    (slug: string) =>
    apiClient.get<Listing>(API_ENDPOINTS.LISTINGS.GET_BY_SLUG(slug)),

  getMyListings:() =>
    apiClient.get<Listing[]>(API_ENDPOINTS.LISTINGS.MY_LISTINGS),

  create:       (data: any) =>
    apiClient.post<Listing>(API_ENDPOINTS.LISTINGS.CREATE, data),

  update:       (id: string, data: any) =>
    apiClient.put<Listing>(API_ENDPOINTS.LISTINGS.UPDATE(id), data),

  updateStatus: (id: string, status: 'active' | 'paused') =>
    apiClient.patch<Listing>(API_ENDPOINTS.LISTINGS.UPDATE_STATUS(id), { status }),

  delete:       (id: string) =>
    apiClient.delete<{ message: string }>(API_ENDPOINTS.LISTINGS.DELETE(id)),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsService = {
  getAll:       (filters?: ProductFilters) =>
    apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.GET_ALL, { params: filters }),

  getFeatured:  (limit?: number) =>
    apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.GET_FEATURED, { params: { limit } }),

  getById:      (id: string) =>
    apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),

  getBySlug:    (slug: string) =>
    apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug)),

  getByVendor:  (vendorId: string) =>
    apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.GET_BY_VENDOR(vendorId)),

  getMyProducts:() =>
    apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.MY_PRODUCTS),

  create:       (data: any) =>
    apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data),

  update:       (id: string, data: any) =>
    apiClient.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),

  updateStatus: (id: string, status: 'active' | 'paused' | 'out_of_stock') =>
    apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), { status }),

  updateInventory: (id: string, data: any) =>
    apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE_INVENTORY(id), data),

  delete:       (id: string) =>
    apiClient.delete<{ message: string }>(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsService = {
  create:          (data: any) =>
    apiClient.post(API_ENDPOINTS.BOOKINGS.CREATE, data),

  getMyBookings:   (filters?: any) =>
    apiClient.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, { params: filters }),

  getVendorBookings:(filters?: any) =>
    apiClient.get(API_ENDPOINTS.BOOKINGS.VENDOR_BOOKINGS, { params: filters }),

  getPending:      () =>
    apiClient.get(API_ENDPOINTS.BOOKINGS.PENDING),

  getById:         (id: string) =>
    apiClient.get(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id)),

  accept:          (id: string) =>
    apiClient.patch(API_ENDPOINTS.BOOKINGS.ACCEPT(id), {}),

  decline:         (id: string, reason: string) =>
    apiClient.patch(API_ENDPOINTS.BOOKINGS.DECLINE(id), { reason }),

  cancel:          (id: string, reason: string) =>
    apiClient.patch(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
};

export const availabilityService = {
  get: (listingId: string, startDate: string, endDate: string) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET(listingId), {
      params: { startDate, endDate },
    }),
 
  getCalendar: (listingId: string, startDate: string, endDate: string) =>
    apiClient.get(API_ENDPOINTS.AVAILABILITY.GET_CALENDAR(listingId), {
      params: { startDate, endDate },
    }),
 
  blockDates: (listingId: string, dates: string[], reason?: string) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.BLOCK_DATES(listingId), { dates, reason }),
 
  unblockDates: (listingId: string, dates: string[]) =>
    apiClient.post(API_ENDPOINTS.AVAILABILITY.UNBLOCK_DATES(listingId), { dates }),
};

// ── Vendors ───────────────────────────────────────────────────────────────────
export const vendorsService = {
  apply:           (data: any) =>
    apiClient.post(API_ENDPOINTS.VENDORS.APPLY, data),

  getProfile:      () =>
    apiClient.get(API_ENDPOINTS.VENDORS.MY_PROFILE),

  updateProfile:   (data: any) =>
    apiClient.put(API_ENDPOINTS.VENDORS.UPDATE_PROFILE, data),

  addPayoutDetails:(data: any) =>
    apiClient.post(API_ENDPOINTS.VENDORS.PAYOUT_DETAILS, data),

  getPublicProfile:(id: string) =>
    apiClient.get(API_ENDPOINTS.VENDORS.PUBLIC_PROFILE(id)),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminService = {
  getPendingVendors:() =>
    apiClient.get(API_ENDPOINTS.ADMIN_VENDORS.PENDING),

  getAllVendors:    (filters?: any) =>
    apiClient.get(API_ENDPOINTS.ADMIN_VENDORS.GET_ALL, { params: filters }),

  getVendorById:   (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN_VENDORS.GET_BY_ID(id)),

  reviewVendor:    (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
    apiClient.put(API_ENDPOINTS.ADMIN_VENDORS.REVIEW(id), { status, rejectionReason }),

  suspendVendor:   (id: string, reason: string) =>
    apiClient.put(API_ENDPOINTS.ADMIN_VENDORS.SUSPEND(id), { reason }),

  getAllBookings:   (filters?: any) =>
    apiClient.get(API_ENDPOINTS.ADMIN_BOOKINGS.GET_ALL, { params: filters }),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadService = {
  uploadImage:     (file: File) =>
    apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.SINGLE_IMAGE, file),

  uploadImages:    (files: File[]) =>
    apiClient.uploadMultipleFiles<{ urls: string[] }>(API_ENDPOINTS.UPLOAD.MULTIPLE_IMAGES, files),

  uploadDocument:  (file: File) =>
    apiClient.uploadFile<{ url: string }>(API_ENDPOINTS.UPLOAD.DOCUMENT, file),

  deleteFile:      (url: string) =>
    apiClient.post<{ message: string }>(API_ENDPOINTS.UPLOAD.DELETE, { url }),
};