// app/(vendor)/vendor/listings/new/page.tsx
// ✅ Server Component — fetches categories server-side, passes to client wizard
// Auth enforced by middleware — no useEffect auth checks

import { NewListingForm } from '../../../../components/listings/new-listing/NewListingForm';
import Link               from 'next/link';
import { ChevronLeft }    from 'lucide-react';
import { serverFetch }    from '../../../../lib/api/server';

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray((value as any)?.data)) return (value as any).data;
  return [];
}

export default async function NewListingPage() {
  // Categories rarely change — opt back into a 1hr cache instead of
  // serverFetch's no-store default (one of the few endpoints where this is safe).
  const { data, error } = await serverFetch<any>('/categories', {
    next: { revalidate: 3600 },
  });
  if (error) {
    console.error('[NewListingPage] /categories failed:', error);
  }
  const categories = asArray(data);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/vendor/listings"
          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 no-underline transition-colors">
          <ChevronLeft size={14} /> My Listings
        </Link>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-bold text-gray-700">New Listing</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Create Listing</h1>
        <p className="text-sm text-gray-500">Fill in the details below to publish your venue or service.</p>
      </div>

      <NewListingForm categories={categories} />
    </div>
  );
}