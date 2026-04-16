'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';

export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setTokenAndFetchUser } = useAuth(); // add this method to your auth context

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) { router.replace('/auth/login?error=google_failed'); return; }
    if (!token) { router.replace('/auth/login'); return; }

    setTokenAndFetchUser(token).then(() => {
      router.replace('/');
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}