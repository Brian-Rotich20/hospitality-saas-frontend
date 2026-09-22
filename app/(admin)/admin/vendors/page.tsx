// app/(admin)/admin/vendors/page.tsx
export const dynamic = 'force-dynamic';

import { serverFetch }            from '../../../lib/api/server';
import { VendorManagementClient } from '../../../components/admin/VendorManagementClient';
import type { Vendor }            from '../../../lib/types/vendor';

// GET /admin/vendors joins user account info alongside the base Vendor shape.
interface AdminVendorRow extends Vendor {
  user?: { fullName?: string; email?: string };
}

export default async function AdminVendorsPage() {
  const { data: vendors, error } = await serverFetch<AdminVendorRow[]>('/admin/vendors');

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
          Review vendors and suspend accounts if needed.
        </p>
      </div>

      <VendorManagementClient initialVendors={vendors ?? []} />
    </div>
  );
}