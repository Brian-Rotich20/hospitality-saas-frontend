// components/dashboard/StatCard.tsx
// Shared by both the admin dashboard and the vendor dashboard so the two
// never drift out of sync. No 'use client' needed — pure presentation,
// works fine inside a Server Component tree.
// Color system: primary green #085F19 · mint tint #EAF7F5 · page bg #F7F9FB

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface StatCardProps {
  label:   string;
  value:   string | number;
  note?:   string;
  icon:    React.ElementType;
  /** true = highlight this card (the "needs attention" card) */
  urgent?: boolean;
  actionHref?:  string;
  actionLabel?: string;
}

export function StatCard({
  label, value, note, icon: Icon, urgent, actionHref, actionLabel = 'Review now',
}: StatCardProps) {
  const accent = urgent ? 'bg-[#EAF7F5] text-[#085F19]' : 'bg-[#085F19]/5 text-[#085F19]';

  return (
    <div
      className={`bg-white rounded-[22px] p-4 border ${
        urgent ? 'border-[#085F19]/20 ring-1 ring-[#EAF7F5]' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-3">
        <span className={`inline-flex p-1.5 rounded-lg ${accent}`}>
          <Icon size={14} />
        </span>
        {label}
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">{value}</span>
        {note && <span className="text-[10px] text-gray-400 text-right">{note}</span>}
      </div>

      {urgent && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 text-[10px] font-bold text-[#085F19] flex items-center gap-1 no-underline hover:opacity-70"
        >
          {actionLabel} <ArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}