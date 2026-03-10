// app/(vendor)/vendor/listings/new/page.tsx
// ✅ Server Component — fetches categories server-side, passes to client form
// Auth enforced by middleware — no useEffect auth checks

import { cookies }         from 'next/headers';
import { NewListingForm }  from '../../../../components/listings/NewListingForm';
import Link                from 'next/link';
import { ChevronLeft }     from 'lucide-react';

async function fetchCategories(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  try {
    const res = await fetch(`${API}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }, // categories rarely change
    });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export default async function NewListingPage() {
  const cookieStore  = await cookies();
  const token        = cookieStore.get('access_token')?.value ?? '';
  const categories   = await fetchCategories(token);

  return (
    <div>
      {/* Breadcrumb */}
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

      {/* Client form gets categories from server */}
      <NewListingForm categories={categories} />
    </div>
  );
}