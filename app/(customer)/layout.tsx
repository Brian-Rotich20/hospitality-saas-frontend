'use client';

import React from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { CustomerNav } from '../components/layout/CustomerNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Verify user is customer role
  React.useEffect(() => {
    if (!isLoading && user?.role !== 'customer') {
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
        <Sidebar role="customer" />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileNav role="customer" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomerNav />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}