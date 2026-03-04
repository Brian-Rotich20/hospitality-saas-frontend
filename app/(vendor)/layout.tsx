'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { VendorSidebar } from '../components/vendor/VendorSidebar';
import { VendorTopbar } from '../components/vendor/VendorTopbar';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!isLoading && user?.role !== 'vendor') { router.push('/dashboard'); }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated || user?.role !== 'vendor') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <VendorSidebar />

      {/* Main — pushed right on desktop, full width on mobile */}
      <div className="vendor-main" style={{ minHeight: '100vh' }}>
        <VendorTopbar />
        <main style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1025px) { .vendor-main { margin-left: 228px; } }
        @media (max-width: 1024px) { .vendor-main { margin-left: 0; } }
      `}</style>
    </div>
  );
}