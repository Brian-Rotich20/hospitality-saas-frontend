'use client';

import { useEffect } from 'react';
import { useAuth }             from '../../lib/auth/auth.context';
import { useRouter }           from 'next/navigation';
import { LoadingSpinner }      from '../../components/common/LoadingSpinner';
import { AppShell }            from '../../components/layout/AppShell';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated)          { router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    if (user?.role !== 'customer') { router.push('/store');      return; }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading)                                     return <LoadingSpinner fullPage />;
  if (!isAuthenticated || user?.role !== 'customer') return null;

  return <AppShell width={1000}>{children}</AppShell>;
}