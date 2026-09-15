// app/(vendor)/vendor/listings/page.tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { VendorListingsClient } from '../../../components/listings/VendorListingsClient';
import { serverFetch } from '../../../lib/api/server';
import type { Listing } from '../../../lib/types/listing';

export default async function VendorListingsPage() {
  const { data: listings, error } = await serverFetch<Listing[]>('/listings/me');

  if (error) {
    console.error('[VendorListingsPage] failed to load listings:', error);
  }

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

      <VendorListingsClient initialListings={listings ?? []} />
    </div>
  );
}