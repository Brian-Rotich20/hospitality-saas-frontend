'use client';

import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { AdminTopbar } from '../../components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
        hideOwnToggle
      />
      <div className="lg:ml-56 min-h-screen flex flex-col">
        <AdminTopbar onMobileMenuToggle={() => setMobileOpen(v => !v)} />
        <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}