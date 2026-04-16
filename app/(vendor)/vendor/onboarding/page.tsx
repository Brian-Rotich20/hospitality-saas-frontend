'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { VendorOnboarding } from '../../../components/vendor/VendorOnboarding';

export default function VendorOnboardingPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google flow passes token as query param; email flow stores in sessionStorage
    const token = searchParams.get('token');
    if (token) sessionStorage.setItem('vendorToken', token);
  }, []);

  return <VendorOnboarding />;
}