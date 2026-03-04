// app/store/page.tsx  ← this is the SERVER component (no 'use client'
import { Suspense } from 'react';
import { StoreContent } from '../../components/listings/StoreContent';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const metadata = {
  title: 'LinkMall — Browse Venues & Services',
  description: 'Discover and book verified venues, caterers, and hospitality vendors across Kenya.',
};

export default function StorePage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage text="Loading store..." />}>
      <StoreContent />
    </Suspense>
  );
}