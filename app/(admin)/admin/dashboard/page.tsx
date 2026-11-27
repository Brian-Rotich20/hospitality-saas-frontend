'use client';

// Admin overview: what needs a person, and whether the platform is healthy. There is no
// count endpoint and lists return at most 100 rows, so a full page is shown as "100+".

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { adminBillingService, adminModerationService, adminOperationsService, adminService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { formatMoney } from '../../../lib/subscriptions/subscription-ui';
import { Badge, Card, Notice, PageHeader, Skeleton } from '../../../components/ui/Surface';
import { Button } from '../../../components/ui/Button';

const CAP = 100;
const capped = (n: number) => (n >= CAP ? `${CAP}+` : String(n));

interface Health {
  database: boolean; redis: boolean; alive: boolean;
  outbox: { pending: number; deadLettered: number; oldestPendingAt: string | null };
  payments: { awaitingReview: number; unprocessedProviderEvents: number };
}

export default function AdminDashboardPage() {
  const health = useLoad(() => adminOperationsService.health() as unknown as Promise<{ data: Health }>, []);
  const requests = useLoad(() => adminService.getAllBookings({ status: 'requested', limit: CAP }) as Promise<{ data: unknown[] }>, []);
  const suspended = useLoad(() => adminService.getAllVendors({ status: 'suspended', limit: CAP }) as unknown as Promise<{ data: unknown[] }>, []);
  const reports = useLoad(() => adminModerationService.reports(), []);
  const plans = useLoad(() => adminBillingService.plans(), []);

  const activePlan = plans.data?.find((p) => p.isActive) ?? null;
  const h = health.data;

  const attention = [
    { label: 'Payments to review', value: h ? h.payments.awaitingReview : null, href: '/admin/payments', urgent: (h?.payments.awaitingReview ?? 0) > 0 },
    { label: 'Reported messages', value: reports.data ? new Set(reports.data.map((r) => r.message.id)).size : null, href: '/admin/messages', urgent: (reports.data?.length ?? 0) > 0 },
    { label: 'Requests awaiting a vendor', value: requests.data ? capped(requests.data.length) : null, href: '/admin/bookings', urgent: false },
    { label: 'Suspended vendors', value: suspended.data ? capped(suspended.data.length) : null, href: '/admin/vendors', urgent: false },
  ];
  const anyError = health.error || requests.error || suspended.error || reports.error || plans.error;

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="What needs attention across LinkMart today." />

      {anyError && (
        <Notice tone="error" title="Some figures couldn’t be loaded"
          action={<Button size="sm" variant="secondary" onClick={() => { void health.reload(); void requests.reload(); void suspended.reload(); void reports.reload(); void plans.reload(); }}>Retry</Button>} />
      )}

      {plans.data && !activePlan && (
        <Notice tone="warning" title="No subscription price is active"
          action={<Link href="/admin/subscriptions" className="text-[13px] font-semibold underline">Set a price</Link>}>
          Vendors aren’t billed when their trial ends until a price is activated.
        </Notice>
      )}

      <Card title="Needs attention" padded={false}>
        <ul className="divide-y divide-border">
          {attention.map((a) => (
            <li key={a.label}>
              <Link href={a.href} className="flex items-center gap-3 px-5 py-4 no-underline hover:bg-page transition-colors">
                <span className="flex-1 text-[15px] text-text-primary">{a.label}</span>
                {a.value === null ? <Skeleton className="h-5 w-8" />
                  : <span className={`text-[17px] font-bold tabular ${a.urgent ? 'text-brand' : 'text-text-primary'}`}>{a.value}</span>}
                <ChevronRight size={16} className="text-text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <Card title="Subscription price" action={<Link href="/admin/subscriptions" className="text-[13px] font-semibold text-text-secondary hover:text-text-primary">Manage</Link>}>
          {plans.loading && !plans.data ? <Skeleton className="h-8 w-40" /> : activePlan ? (
            <p className="text-[22px] font-bold tabular">{formatMoney(activePlan.amountMinor, activePlan.currency)}<span className="text-[14px] font-medium text-text-secondary"> per {activePlan.interval} · {activePlan.name}</span></p>
          ) : <p className="text-[15px] text-text-secondary">Not set</p>}
        </Card>

        <Card title="System">
          {!h ? <Skeleton className="h-24 w-full" /> : (
            <ul className="space-y-2.5 text-[14px]">
              <li className="flex justify-between"><span>Database</span>{h.database ? <Badge tone="success" dot>OK</Badge> : <Badge tone="error" dot>Down</Badge>}</li>
              <li className="flex justify-between"><span>Redis</span>{h.redis ? <Badge tone="success" dot>OK</Badge> : <Badge tone="error" dot>Down</Badge>}</li>
              <li className="flex justify-between"><span>Background worker</span>{h.alive ? <Badge tone="success" dot>Running</Badge> : <Badge tone="error" dot>Not running</Badge>}</li>
              <li className="flex justify-between"><span>Emails waiting</span><span className="tabular font-semibold">{h.outbox.pending}</span></li>
              <li className="flex justify-between"><span>Emails failed</span>{h.outbox.deadLettered > 0 ? <Badge tone="error">{h.outbox.deadLettered}</Badge> : <span className="tabular font-semibold">0</span>}</li>
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
