'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.replace('/');
    });
  }, [searchParams, router, setTokenAndFetchUser]);

  return null;
}