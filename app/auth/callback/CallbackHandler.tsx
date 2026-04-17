'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setTokenAndFetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.replace('/auth/login?error=google_failed');
      return;
    }

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setTokenAndFetchUser(token).then(() => {
      // Decide redirect based on current route
      if (pathname.startsWith('/vendor')) {
        router.replace('/vendor/dashboard'); // or onboarding continuation
      } else {
        router.replace('/'); // customer default
      }
    });
  }, [searchParams, router, setTokenAndFetchUser, pathname]);

  return null;
}