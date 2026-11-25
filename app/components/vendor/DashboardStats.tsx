// components/vendor/DashboardStats.tsx
// Server Component. serverFetch() forwards the Better Auth session cookie.
// There is no vendor stats endpoint, so counts come from the booking lists
// (each capped at 100 rows; shown as "100+" beyond that). No revenue figure:
// LinkMart does not process or know booking payments.

import { Calendar, CheckCircle, Clock, Package } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { serverFetch } from '../../lib/api/server';

const CAP = 100;

async function count(path: string): Promise<number | null> {
  const { data, error } = await serverFetch<unknown[]>(path);
  if (error) {
    console.error(`[DashboardStats] ${path} failed:`, error);
    return null;
  }
  return Array.isArray(data) ? data.length : 0;
}

const show = (n: number | null) => (n === null ? '–' : n >= CAP ? `${CAP}+` : n);

export async function DashboardStats() {
  const [pending, accepted, completed, listings] = await Promise.all([
    count('/bookings/vendor/pending'),
    count(`/bookings/vendor?status=accepted&limit=${CAP}`),
    count(`/bookings/vendor?status=completed&limit=${CAP}`),
    count('/listings/me'),
  ]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <StatCard
        label="Open requests"
        value={show(pending)}
        note={pending ? 'Reply within 24 hours' : 'All clear'}
        icon={Clock}
        urgent={!!pending}
        {...(pending ? { actionHref: '/vendor/bookings', actionLabel: 'Respond' } : {})}
      />
      <StatCard label="Accepted" value={show(accepted)} note="Confirmed bookings" icon={Calendar} />
      <StatCard label="Completed" value={show(completed)} icon={CheckCircle} />
      <StatCard label="My Listings" value={show(listings)} icon={Package} />
    </div>
  );
}
