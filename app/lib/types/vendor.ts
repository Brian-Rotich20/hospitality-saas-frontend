// Vendor types for defining the structure of vendor-related data, such as vendor information, services offered, and contact details.
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description: string;
  status: VendorStatus;
  kycStatus: 'pending' | 'verified' | 'rejected';
  documents: VendorDocument[];
  payoutDetails?: PayoutDetails;
  createdAt: string;
  updatedAt: string;
}

export interface VendorDocument {
  id: string;
  type: string;
  url: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface PayoutDetails {
  bankAccount: string;
  accountHolder: string;
  routingNumber?: string;
  swiftCode?: string;
  preferredPayoutDay: number;
}