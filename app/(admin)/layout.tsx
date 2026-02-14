'use client';

import React from 'react';
import { useAuth } from '../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { MobileNav } from '../components/layout/MobileNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Verify user is admin role
  React.useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
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
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileNav role="admin" />
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