'use client';

// Customer accounts (read-only). GET /admin/customers?limit&offset.

import { useState } from 'react';
import { adminService } from '../../../lib/api/endpoints';
import { useLoad } from '../../../lib/hooks/useLoad';
import { formatDay } from '../../../lib/subscriptions/subscription-ui';
import { Badge, Card, PageHeader, Table } from '../../../components/ui/Surface';
import { LoadState, PAGE_SIZE, Pager } from '../../../components/admin/AdminList';

interface CustomerRow { id: string; fullName: string | null; email: string; phone: string | null; verified: boolean; banned: boolean | null; createdAt: string }

export default function AdminCustomersPage() {
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(
    () => adminService.getAllCustomers({ limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE } as never) as unknown as Promise<{ data: CustomerRow[] }>,
    [page],
  );
  const rows = (data ?? []).slice(0, PAGE_SIZE);

  return (
    <div>
      <PageHeader title="Customers" description="People who book through LinkMart." />
      <Card padded={false}>
        <LoadState loading={loading} error={error} empty={rows.length === 0} onRetry={() => void reload()} emptyTitle="No customers yet">
          <Table label="Customers">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Email verified</th><th>Joined</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.fullName ?? '—'}{c.banned && <span className="ml-2"><Badge tone="error">Banned</Badge></span>}</td>
                  <td>{c.email}</td>
                  <td>{c.phone ?? '—'}</td>
                  <td>{c.verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Not verified</Badge>}</td>
                  <td>{formatDay(c.createdAt)}</td>
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
