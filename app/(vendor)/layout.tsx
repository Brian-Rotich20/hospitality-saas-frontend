'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { VendorTopbar } from '../components/vendor/VendorTopbar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Color system: primary green #085F19 · mint tint #EAF7F5 · page bg #F7F9FB
const PUBLIC_VENDOR_PATHS = ['/vendor/verify-email', '/vendor/onboarding'];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isMidOnboarding = PUBLIC_VENDOR_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'vendor' && !isMidOnboarding) {
      router.push('/store');
      return;
    }
  }, [isAuthenticated, isLoading, user, isMidOnboarding, router]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return null;
  if (user?.role !== 'vendor' && !isMidOnboarding) return null;

  if (isMidOnboarding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:ml-[220px] min-h-screen flex flex-col">
        <VendorTopbar />
        <main className="flex-1 p-4 md:p-6 max-w-[1100px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}