'use client';

import { useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter, usePathname } from 'next/navigation';
import { AppShell } from '../components/layout/AppShell';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const PUBLIC_VENDOR_PATHS = ['/vendor/verify-email', '/vendor/onboarding'];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isMidOnboarding = PUBLIC_VENDOR_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    if (user?.role !== 'vendor' && !isMidOnboarding) {
      router.push('/store');
      return;
    }
  }, [isAuthenticated, isLoading, user, isMidOnboarding, router]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return null;
  if (user?.role !== 'vendor' && !isMidOnboarding) return null;
  if (isMidOnboarding) return <>{children}</>;

  return <AppShell>{children}</AppShell>;
}