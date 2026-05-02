'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter }           from 'next/navigation';
import { Sidebar }             from '../components/layout/Sidebar';
import { VendorTopbar }        from '../components/vendor/VendorTopbar';
import { LoadingSpinner }      from '../components/common/LoadingSpinner';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated)        { router.push('/auth/login'); return; }
    if (user?.role !== 'vendor') { router.push('/store');      return; }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading)                                   return <LoadingSpinner fullPage />;
  if (!isAuthenticated || user?.role !== 'vendor') return null;

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