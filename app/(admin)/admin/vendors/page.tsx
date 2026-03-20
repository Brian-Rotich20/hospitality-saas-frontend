// app/(admin)/admin/vendors/page.tsx
export const dynamic = 'force-dynamic';

import { cookies }                from 'next/headers';
import { serverFetch }            from '../../../lib/api/server';
import { VendorManagementClient } from '../../../components/admin/VendorManagementClient';
import { AlertCircle }            from 'lucide-react';

// Mirror the Vendor type from VendorManagementClient (or import it if exported)
interface Vendor {
  id:           string;
  businessName: string;
  description?: string;
  phoneNumber?: string;
  city?:        string;
  status:       'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt:    string;
  user?: {
    fullName?: string;
    email?:    string;
  };
}

export default async function AdminVendorsPage() {
  const token = (await cookies()).get('access_token')?.value ?? '';

  const [{ data: allVendors, error }, { data: pendingVendors }] = await Promise.all([
    serverFetch<Vendor[]>('/admin/vendors',         token),
    serverFetch<Vendor[]>('/admin/vendors/pending', token),
  ]);

  const pendingMap = new Map((pendingVendors ?? []).map(v => [v.id, v]));
  const allMap     = new Map((allVendors    ?? []).map(v => [v.id, v]));
  const merged     = Array.from(new Map([...allMap, ...pendingMap]).values());

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

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-0.5">Could not load vendors</p>
            <p className="text-xs text-red-600 font-mono">{error}</p>
          </div>
        </div>
      )}

      <VendorManagementClient initialVendors={merged} />
    </div>
  );
}