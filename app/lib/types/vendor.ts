// lib/types/vendor.ts
export type VendorStatus = 'approved' | 'suspended';
export type PayoutMethod = 'mpesa' | 'bank';

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  logo?: string | null;
  verified: boolean;
  /** Public business contact (shown on every listing). Separate from the login email. */
  businessEmail?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  /** Owner view only (GET/PUT /vendors/me): private, never shown to customers. */
  payoutDetails?: { method: PayoutMethod | null; mpesaNumber: string | null; bankAccountName: string | null; bankAccountNumber: string | null; bankName: string | null };
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  // Only present on GET /vendors/me — computed, not stored
  profileComplete?: boolean;
  missing?: string[];
  /** Contact fields (API names) still needed before a listing can be published. */
  contactMissing?: ('businessEmail' | 'phoneNumber' | 'whatsappNumber')[];
  onboardedAt?: string | null;
}

export interface UpdateVendorInput {
  businessName?: string;
  logo?: string;
  /** null or "" clears the field. */
  businessEmail?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
}

export type PayoutDetailsInput =
  | { payoutMethod: 'mpesa'; mpesaNumber: string }
  | { payoutMethod: 'bank'; bankAccountName: string; bankAccountNumber: string; bankName: string };