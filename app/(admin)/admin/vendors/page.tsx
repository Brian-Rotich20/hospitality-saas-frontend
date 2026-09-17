// app/(admin)/admin/vendors/page.tsx
export const dynamic = 'force-dynamic';

import { serverFetch }            from '../../../lib/api/server';
import { VendorManagementClient } from '../../../components/admin/VendorManagementClient';

// Mirror the Vendor type from VendorManagementClient (or import it if exported)
interface Vendor {
  id:           string;
  businessName: string;
  description?: string;
  phoneNumber?: string;
  county?:        string;
  status:       'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt:    string;
  user?: {
    fullName?: string;
    email?:    string;
  };
}

export default async function AdminVendorsPage() {
  const { data: vendors, error } = await serverFetch<Vendor[]>('/admin/vendors');

  if (error) {
    console.error('[AdminVendorsPage] /admin/vendors failed:', error);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight mb-1">
          Vendor Management
        </h1>
        <p className="text-sm text-gray-500">
          Review applications, approve or reject vendors.
        </p>
      </div>

      <VendorManagementClient initialVendors={vendors ?? []} />
    </div>
  );
}