'use client';

// Shared admin list furniture: status filter tabs, a pager for endpoints that return plain
// arrays (we request limit + 1 rows to know whether a next page exists), and one
// loading / error / empty treatment.

import { RefreshCw } from 'lucide-react';
import type { ApiError } from '../../lib/api/client';
import { Button } from '../ui/Button';
import { EmptyState, Notice, Skeleton } from '../ui/Surface';

export const PAGE_SIZE = 25;

export function FilterTabs<T extends string>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto hide-scrollbar border-b border-border mb-4">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={`px-3 py-2.5 -mb-px text-[14px] font-semibold whitespace-nowrap border-b-2 transition-colors
            ${o.value === value ? 'border-ink text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, hasNext, onPage, shown }: { page: number; hasNext: boolean; onPage: (p: number) => void; shown: number }) {
  if (page === 0 && !hasNext) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border text-[13px] text-text-secondary">
      <span className="tabular">Rows {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + shown}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button size="sm" variant="secondary" disabled={!hasNext} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function LoadState({ loading, error, empty, onRetry, emptyTitle, emptyText, rows = 4, children }: {
  loading: boolean;
  error: ApiError | null;
  empty: boolean;
  onRetry: () => void;
  emptyTitle: string;
  emptyText?: string;
  rows?: number;
  children: React.ReactNode;
}) {
  if (error) {
    return (
      <div className="p-5">
        <Notice tone="error" title={error.status === 403 ? 'You don’t have access to this.' : error.message || 'Could not load this list.'}
          action={<Button size="sm" variant="secondary" onClick={onRetry}><RefreshCw size={13} aria-hidden /> Retry</Button>} />
      </div>
    );
  }
  if (loading && empty) {
    return (
      <div className="p-5 space-y-3" aria-busy="true">
        {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }
  if (empty) return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
  return <div className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>;
}
