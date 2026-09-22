// lib/types/vendor.ts
export type VendorStatus = 'approved' | 'suspended';
export type PayoutMethod = 'mpesa' | 'bank';

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  phoneNumber?: string;
  logo?: string;
  verified: boolean;
  payoutMethod?: PayoutMethod;
  mpesaNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  // Only present on GET /vendors/me — computed, not stored
  missing?: string[];
  onboardedAt?: string | null;
}

export interface UpdateVendorInput {
  businessName?: string;
  phoneNumber?: string;
  logo?: string;
}

export type PayoutDetailsInput =
  | { payoutMethod: 'mpesa'; mpesaNumber: string }
  | { payoutMethod: 'bank'; bankAccountName: string; bankAccountNumber: string; bankName: string };