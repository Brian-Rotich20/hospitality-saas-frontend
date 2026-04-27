'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import toast from 'react-hot-toast';

export default function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setTokenAndFetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      router.replace('/auth/login');
      return;
    }

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setTokenAndFetchUser(token);
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen bg-[#2D3B45] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}