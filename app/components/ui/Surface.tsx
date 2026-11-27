// Layout primitives: page header, card sections, notices, status badges, empty and
// loading states. Server-safe (no client hooks) so server pages can use them too.

import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

export function PageHeader({ title, description, actions, back }: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary no-underline mb-3">
          <ArrowLeft size={14} aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.015em] text-text-primary text-balance">{title}</h1>
          {description && <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary max-w-[65ch]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, description, action, children, className = '', padded = true, as: Tag = 'section' }: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  padded?: boolean;
  as?: 'section' | 'div' | 'article';
}) {
  return (
    <Tag className={`bg-card border border-border rounded-2xl ${className}`}>
      {(title || action) && (
        <header className={`flex items-start justify-between gap-3 ${padded ? 'px-5 pt-5' : 'px-5 py-4 border-b border-border'}`}>
          <div className="min-w-0">
            {title && <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-text-secondary">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padded ? `px-5 pb-5 ${title || action ? 'pt-4' : 'pt-5'}` : ''}>{children}</div>
    </Tag>
  );
}

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'brand';

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-text-secondary border-border',
  info:    'bg-info-bg text-info border-info-border',
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  error:   'bg-error-bg text-error border-error-border',
  brand:   'bg-accent-bg text-brand-text border-[#F2CFA6]',
};
const ICON = { neutral: Info, info: Info, success: CheckCircle2, warning: TriangleAlert, error: AlertCircle, brand: Info };

export function Notice({ tone = 'info', title, children, action, role }: {
  tone?: Tone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  role?: 'alert' | 'status';
}) {
  const Icon = ICON[tone];
  return (
    <div role={role ?? (tone === 'error' ? 'alert' : undefined)}
      className={`flex gap-3 rounded-xl border px-4 py-3 ${TONE[tone]}`}>
      <Icon size={18} className="shrink-0 mt-px" aria-hidden />
      <div className="min-w-0 flex-1 text-[14px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function Badge({ tone = 'neutral', children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap ${TONE[tone]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function EmptyState({ title, children, action, icon }: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-4 w-11 h-11 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center" aria-hidden>{icon}</div>}
      <p className="text-[16px] font-semibold text-text-primary">{title}</p>
      {children && <p className="mt-1 text-[14px] text-text-secondary max-w-[44ch] mx-auto">{children}</p>}
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-lg bg-surface-muted animate-pulse ${className}`} aria-hidden />;
}

/** Label/value rows for detail views. */
export function DescriptionList({ items }: { items: { label: React.ReactNode; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <dt className="text-[13px] text-text-secondary">{it.label}</dt>
          <dd className="text-[14px] font-medium text-text-primary sm:text-right tabular">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Table wrapper: scrolls inside its card on narrow screens instead of the page. */
export function Table({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative overflow-x-auto -mx-px">
      <table aria-label={label} className="w-full min-w-[640px] text-[14px] tabular
        [&_th]:text-left [&_th]:font-semibold [&_th]:text-[12px] [&_th]:text-text-secondary [&_th]:px-5 [&_th]:py-2.5 [&_th]:bg-page [&_th]:border-b [&_th]:border-border [&_th]:whitespace-nowrap
        [&_td]:px-5 [&_td]:py-3.5 [&_td]:border-b [&_td]:border-border [&_td]:align-middle [&_tr:last-child_td]:border-b-0">
        {children}
      </table>
    </div>
  );
}
