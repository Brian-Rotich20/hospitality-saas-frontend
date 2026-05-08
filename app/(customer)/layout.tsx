'use client';

import { useState, useEffect } from 'react';
import { useAuth }             from '../lib/auth/auth.context';
import { useRouter }           from 'next/navigation';
import { LoadingSpinner }      from '../components/common/LoadingSpinner';
import { CustomerTopbar }      from '../components/customer/CustomerTopbar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated)          { router.push('/auth/login'); return; }
    if (user?.role !== 'customer') { router.push('/store');      return; }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading)                                     return <LoadingSpinner fullPage />;
  if (!isAuthenticated || user?.role !== 'customer') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CustomerTopbar onMobileMenuToggle={() => setMobileOpen(v => !v)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1000px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}