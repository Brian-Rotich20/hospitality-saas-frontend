import { statusMeta } from '../../lib/bookings/booking-ui';

export function BookingStatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const m = statusMeta(status);
  const sizing = size === 'md' ? 'text-[11px] px-2.5 py-1' : 'text-[10px] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full whitespace-nowrap ${sizing} ${m.chip}`}>
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
