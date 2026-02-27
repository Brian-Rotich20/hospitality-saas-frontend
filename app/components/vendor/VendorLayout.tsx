'use client';

import React from 'react';
import { VendorSidebar } from './VendorSidebar';
import { VendorTopbar } from './VendorTopbar';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <VendorTopbar />

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}