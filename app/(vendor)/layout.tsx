'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { VendorSidebar } from '../components/layout/VendorSidebar';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated)        { router.push('/auth/login'); return; }
    if (user?.role !== 'vendor') { router.push('/store');      return; }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading)                                    return <LoadingSpinner fullPage />;
  if (!isAuthenticated || user?.role !== 'vendor')  return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <VendorSidebar />
      {/* Main content — lg:ml-[228px] matches sidebar width */}
      <div className="flex-1 lg:ml-[228px] min-h-screen flex flex-col">
        <main className="flex-1 p-6 max-w-[1100px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}