'use client';

import React from 'react';
import { VendorSidebar } from './VendorSidebar';
import { VendorTopbar } from './VendorTopbar';
import { useState } from 'react';

interface VendorLayoutProps {
  children: React.ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
   const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
     <VendorSidebar/>
  

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <VendorTopbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}