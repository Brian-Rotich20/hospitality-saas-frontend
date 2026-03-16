// app/(admin)/vendors/page.tsx
// ✅ Server Component — fetches vendors server-side
export const dynamic = 'force-dynamic';

import { cookies }             from 'next/headers';
import { VendorManagementClient } from '@/components/admin/VendorManagementClient';

async function fetchVendors(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminVendorsPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get('access_token')?.value ?? '';
  const vendors     = await fetchVendors(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Vendor Management</h1>
        <p className="text-sm text-gray-500">Review applications, approve or reject vendors.</p>
      </div>
      <VendorManagementClient initialVendors={vendors} />
    </div>
  );
}