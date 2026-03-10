// app/(vendor)/vendor/listings/page.tsx
// ✅ Server Component — fetches vendor's listings on the server

import { cookies }               from 'next/headers';
import Link                      from 'next/link';
import { Plus }                  from 'lucide-react';
import { VendorListingsClient }  from '../../../components/listings/VendorListingsClient';

async function fetchMyListings(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/listings/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store', // always fresh — vendor needs to see latest status
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export default async function VendorListingsPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get('access_token')?.value ?? '';
  const listings    = await fetchMyListings(token);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">My Listings</h1>
          <p className="text-sm text-gray-500">Manage your venues and services</p>
        </div>
        <Link href="/vendor/listings/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3B45] text-white text-xs font-bold
            rounded-xl hover:bg-[#3a4d5a] transition no-underline shrink-0">
          <Plus size={14} /> New Listing
        </Link>
      </div>

      <VendorListingsClient initialListings={listings} />
    </div>
  );
}