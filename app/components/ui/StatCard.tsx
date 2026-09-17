import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  note?: string;
  icon: React.ElementType;
  urgent?: boolean;
  actionHref?: string;
  actionLabel?: string;
}

export function StatCard({
  label, value, note, icon: Icon, urgent, actionHref, actionLabel = 'Review',
}: StatCardProps) {
  return (
    <div className="relative bg-card rounded-2xl p-5 border border-border overflow-hidden">
      {urgent && <span className="absolute top-0 left-0 right-0 h-[3px] bg-brand" />}

      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-surface-muted text-text-secondary">
          <Icon size={16} />
        </span>
        {urgent && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand bg-accent-bg px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Needs action
          </span>
        )}
      </div>

      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[28px] font-black text-text-primary tracking-tight leading-none">{value}</span>
        {note && <span className="text-[11px] text-text-muted whitespace-nowrap pb-0.5">{note}</span>}
      </div>

      {urgent && actionHref && (
        <Link href={actionHref}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-text-primary no-underline
            hover:text-brand transition-colors">
          {actionLabel} <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}