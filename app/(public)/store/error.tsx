'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

// Next.js convention: this catches anything that throws within the /store
// route segment (including a fetch that throws instead of degrading
// gracefully) and shows a friendly retry instead of a blank white screen.
// Note this is a *last-resort, whole-page* net — it does not give per-card
// isolation, that's what CardBoundary is for.
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[/store] render error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
      <AlertTriangle size={28} className="text-amber-500" />
      <p className="text-sm font-bold text-gray-800">Something went wrong loading the store</p>
      <p className="text-xs text-gray-400 max-w-sm">
        This is unrelated to your account — try again, or come back in a moment.
      </p>
      <div className="flex gap-2 mt-2">
        <button onClick={reset}
          className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition">
          Try again
        </button>
        <Link href="/"
          className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:border-gray-400 transition no-underline">
          Go home
        </Link>
      </div>
    </div>
  );
}