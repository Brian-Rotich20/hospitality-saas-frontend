// Transition history from GET /bookings/:id/events.

import type { BookingEvent } from '../../lib/types/booking';
import { formatTimestamp, statusMeta } from '../../lib/bookings/booking-ui';

const BY_ACTOR: Record<string, string> = {
  customer: 'by the customer', vendor: 'by the vendor', system: 'by LinkMart', admin: 'by an administrator',
};

function describe(e: BookingEvent) {
  if (!e.fromStatus) return 'Request sent';
  if (e.toStatus === 'expired') return 'Expired (no reply within 24 hours)';
  if (e.toStatus === 'completed') return 'Marked completed';
  const label = e.toStatus === 'requested' ? 'Requested' : statusMeta(e.toStatus).label;
  return `${label} ${BY_ACTOR[e.actor] ?? ''}`.trim();
}

export function BookingTimeline({ events }: { events: BookingEvent[] }) {
  if (events.length === 0) return <p className="text-xs text-gray-400">No history yet.</p>;
  return (
    <ol className="relative space-y-4 border-l border-gray-200 pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${statusMeta(e.toStatus).dot}`} />
          <p className="text-[13px] font-semibold text-gray-800">{describe(e)}</p>
          <p className="text-[11px] text-gray-400">{formatTimestamp(e.createdAt)}</p>
          {e.reason && <p className="mt-1 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">“{e.reason}”</p>}
        </li>
      ))}
    </ol>
  );
}
