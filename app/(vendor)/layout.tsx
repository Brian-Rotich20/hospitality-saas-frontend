'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter, usePathname }           from 'next/navigation';
import { Sidebar }             from '../components/layout/Sidebar';
import { VendorTopbar }        from '../components/vendor/VendorTopbar';
import { LoadingSpinner }      from '../components/common/LoadingSpinner';

const PUBLIC_VENDOR_PATHS = [
  '/vendor/verify-email',
  '/vendor/onboarding',
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isMidOnboarding = PUBLIC_VENDOR_PATHS.includes(pathname);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) { router.push('/auth/login'); return; }
        // Allow through if fully vendor OR still mid-onboarding as a customer
        if (user?.role !== 'vendor' && !isMidOnboarding) {
          router.push('/store');
          return;
        }
      }, [isAuthenticated, isLoading, user, isMidOnboarding, router]);

      if (isLoading) return <LoadingSpinner fullPage />;
      if (!isAuthenticated) return null;
      if (user?.role !== 'vendor' && !isMidOnboarding) return null;

      // Mid-onboarding: render children WITHOUT the vendor dashboard chrome
      // (no Sidebar/Topbar — they haven't earned the dashboard yet)
      if (isMidOnboarding) {
        return <>{children}</>;
      }
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar handles desktop fixed + mobile drawer internally */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content — offset by sidebar width on desktop only */}
      <div className="lg:ml-56 min-h-screen flex flex-col">
        <VendorTopbar onMobileMenuToggle={() => setMobileOpen(v => !v)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1100px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}