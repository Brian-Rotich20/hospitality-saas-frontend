// app/(public)/store/page.tsx

import { Suspense }       from 'react';
import StoreContent       from '../../components/listings/StoreContent';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

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