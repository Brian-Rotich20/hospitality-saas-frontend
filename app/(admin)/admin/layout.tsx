// app/(admin)/layout.tsx
// ✅ Client Component — manages mobile sidebar state only
// Auth/role protection handled by middleware.ts

'use client';

import { useState }      from 'react';
import { Sidebar }       from '../../components/layout/Sidebar';
import { AdminTopbar }   from '../../components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
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