'use client';

import { AppShell } from '../../components/layout/AppShell';

// Access is enforced by middleware.ts (admins only) and by the backend on every call.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell width={1200}>{children}</AppShell>;
}
