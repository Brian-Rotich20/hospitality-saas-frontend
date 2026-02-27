'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { VendorSidebar } from '../components/vendor/VendorSidebar';
import { VendorTopbar } from '../components/vendor/VendorTopbar';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isLoading && user?.role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <VendorSidebar />

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <VendorTopbar />

        {/* Page Content */}
        <main className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}