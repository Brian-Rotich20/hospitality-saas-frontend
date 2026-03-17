// app/(admin)/vendors/page.tsx
// ✅ Server Component
export const dynamic = 'force-dynamic';

import { cookies }                from 'next/headers';
import { VendorManagementClient } from '../../../components/admin/VendorManagementClient';
import { AlertCircle }            from 'lucide-react';

async function fetchVendors(token: string) {
  // ✅ Server-side fetch MUST use the backend URL directly — not the /api proxy
  // NEXT_PUBLIC_API_URL = '/api' only works in the browser via Next.js rewrites
  // On the server we need the real backend URL
  const API = process.env.BACKEND_URL        // ✅ direct Render URL (server-only env var)
    ?? process.env.NEXT_PUBLIC_API_URL        // fallback if set to full URL
    ?? 'http://localhost:3001/api';

  if (!token) {
    console.error('[AdminVendors] No access_token cookie — user may need to re-login');
    return { vendors: [], error: 'Authentication required' };
  }

  try {
    const res = await fetch(`${API}/admin/vendors`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   'no-store',
    });

    const json = await res.json();

    if (!res.ok) {
      console.error('[AdminVendors] Fetch failed:', res.status, json);
      return { vendors: [], error: `Failed to load vendors (${res.status})` };
    }

    return { vendors: json.data ?? [], error: null };
  } catch (err) {
    console.error('[AdminVendors] Network error:', err);
    return { vendors: [], error: 'Network error — could not reach backend' };
  }
}

export default async function AdminVendorsPage() {
  const cookieStore    = await cookies();
  const token          = cookieStore.get('access_token')?.value ?? '';
  const { vendors, error } = await fetchVendors(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Vendor Management</h1>
        <p className="text-sm text-gray-500">Review applications, approve or reject vendors.</p>
      </div>

      {/* ✅ Show fetch error clearly instead of empty state */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-0.5">Could not load vendors</p>
            <p className="text-xs text-red-600">{error}</p>
            {error.includes('Authentication') && (
              <p className="text-xs text-red-500 mt-1">
                Try logging out and back in to refresh your session.
              </p>
            )}
          </div>
        </div>
      )}

      <VendorManagementClient initialVendors={vendors} />
    </div>
  );
}