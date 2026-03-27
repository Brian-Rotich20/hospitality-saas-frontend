// app/(public)/store/page.tsx
// ✅ force-dynamic — never statically generate, always render on request
// This prevents build timeout from Render backend cold start

import { Suspense }       from 'react';
import StoreContent       from '../../components/listings/StoreContent';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// ✅ Critical — prevents Next.js from trying to fetch at build time
export const dynamic = 'force-dynamic';

export const metadata = {
  title:       'LinkMart — Browse Venues & Services',
  description: 'Discover and book verified venues, caterers, and hospitality vendors across Kenya.',
};

export default function StorePage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage text="Loading listings..." />}>
      <StoreContent />
    </Suspense>
  );
}