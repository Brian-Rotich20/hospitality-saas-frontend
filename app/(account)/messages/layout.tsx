'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth.context';
import { AppShell } from '../../components/layout/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Messages are shared by customers and vendors (admins can read a thread from moderation).
// middleware.ts also redirects signed-out visitors; the backend enforces who may read what.
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return null;
  return <AppShell width={1100}>{children}</AppShell>;
}
