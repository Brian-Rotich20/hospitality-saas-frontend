// app/(public)/store/[id]/not-found.tsx
import Link       from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ListingNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-red-400" />
        </div>
        <p className="text-sm font-bold text-gray-800 mb-1">Listing not found</p>
        <p className="text-xs text-gray-400 mb-5">
          This listing may have been removed or is no longer available.
        </p>
        <Link href="/store"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white
            bg-[#2D3B45] px-4 py-2 rounded-xl no-underline hover:bg-[#3a4d5a] transition-colors">
          <ArrowLeft size={13} /> Back to listings
        </Link>
      </div>
    </div>
  );
}