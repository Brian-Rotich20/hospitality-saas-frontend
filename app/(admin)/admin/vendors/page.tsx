'use client';

// Vendor management. GET /admin/vendors?status=approved|suspended&limit&offset.
// "approved" is the backend's name for an active (not suspended) vendor account.

import { useState } from 'react';
import Link from 'next/link';
import { adminService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { formatDay } from '../../../lib/subscriptions/subscription-ui';
import { Badge, Card, PageHeader, Table } from '../../../components/ui/Surface';
import { FilterTabs, LoadState, PAGE_SIZE, Pager } from '../../../components/admin/AdminList';

export interface AdminVendorRow {
  id: string; userId: string; businessName: string; slug: string; phoneNumber: string | null;
  status: 'approved' | 'suspended'; verified: boolean; createdAt: string;
  user: { email: string; fullName: string | null; phone: string | null };
}

type Filter = 'all' | 'approved' | 'suspended';

export default function AdminVendorsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(
    () => adminService.getAllVendors({ ...(filter === 'all' ? {} : { status: filter }), limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE }) as unknown as Promise<{ data: AdminVendorRow[] }>,
    [filter, page],
  );
  const rows = (data ?? []).slice(0, PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Vendors" description="Every vendor account. Open one to see its billing, or to suspend or reinstate it." />
      <FilterTabs label="Filter vendors" value={filter} onChange={(v) => { setFilter(v); setPage(0); }}
        options={[{ value: 'all', label: 'All' }, { value: 'approved', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
      <Card padded={false}>
        <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()}
          emptyTitle={filter === 'suspended' ? 'No suspended vendors' : 'No vendors yet'}
          emptyText={filter === 'all' ? 'Vendors appear here when customers switch to a vendor account.' : undefined}>
          <Table label="Vendors">
            <thead><tr><th>Business</th><th>Owner</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-page">
                  <td><Link href={`/admin/vendors/${v.id}`} className="font-semibold text-text-primary underline-offset-2 hover:underline">{v.businessName}</Link></td>
                  <td><span className="block">{v.user.fullName ?? '—'}</span><span className="text-[13px] text-text-secondary">{v.user.email}</span></td>
                  <td>{v.phoneNumber ?? v.user.phone ?? '—'}</td>
                  <td>{v.status === 'suspended' ? <Badge tone="error" dot>Suspended</Badge> : <Badge tone="success" dot>Active</Badge>}</td>
                  <td>{formatDay(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pager page={page} hasNext={(data?.length ?? 0) > PAGE_SIZE} onPage={setPage} shown={rows.length} />
        </LoadState>
      </Card>
    </div>
  );
}
