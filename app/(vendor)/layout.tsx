// Vendor dashboard layout component. This is used to wrap all pages in the vendor dashboard.
// It includes the sidebar and the header.
'use client';

import React from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { VendorSidebar } from '../components/layout/VendorSidebar';
import { MobileNav } from '../components/layout/MobileNav';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Verify user is vendor role
  React.useEffect(() => {
    if (!isLoading && user?.role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200 bg-white">
        <VendorSidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileNav role="vendor" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}