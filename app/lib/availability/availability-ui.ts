// Vendor availability rules, mirroring backend/src/modules/availability:
// - the calendar endpoint returns only unavailable days: { available: false, reason: 'Booked' | 'Unavailable' }
//   ('Booked' = an accepted booking, 'Unavailable' = a vendor block; private block reasons are never returned);
// - one calendar request may span at most 366 days; block/unblock take 1–366 dates;
// - blocking a date that has an accepted booking fails with 409 DATES_BOOKED (details.dates lists them).

import type { ApiError } from '../api/client';
import { formatCalendarDate } from '../bookings/booking-ui';

export type DayState = 'open' | 'blocked' | 'booked';
export type CalendarDays = Record<string, { available: boolean; reason?: string }>;

/** How far ahead vendors manage availability (matches the customer calendar's 12-month window). */
export const WINDOW_DAYS = 365;
export const MAX_DATES_PER_CALL = 366;
export const BLOCK_REASON_MAX = 500;

export function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function dayState(days: CalendarDays, d: string): DayState {
  const info = days[d];
  if (!info || info.available) return 'open';
  return info.reason === 'Booked' ? 'booked' : 'blocked';
}

/** Groups sorted YYYY-MM-DD dates into consecutive runs. */
export function toRanges(dates: string[]): { start: string; end: string; dates: string[] }[] {
  const sorted = [...new Set(dates)].sort();
  const out: { start: string; end: string; dates: string[] }[] = [];
  for (const d of sorted) {
    const last = out[out.length - 1];
    if (last && addDaysYmd(last.end, 1) === d) { last.end = d; last.dates.push(d); }
    else out.push({ start: d, end: d, dates: [d] });
  }
  return out;
}

export function rangeLabel(start: string, end: string): string {
  if (start === end) return formatCalendarDate(start, 'EEE d MMM yyyy');
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${formatCalendarDate(start, sameYear ? 'EEE d MMM' : 'EEE d MMM yyyy')} – ${formatCalendarDate(end, 'EEE d MMM yyyy')}`;
}

const CODE_MESSAGES: Record<string, string> = {
  DATES_BOOKED:     'Some of those dates have accepted bookings, so they cannot be blocked. Cancel the booking first, or adjust the selection.',
  VENDOR_SUSPENDED: 'Your vendor account is suspended, so availability cannot be changed.',
  RATE_LIMITED:     'Too many changes in a short time. Wait a minute and try again.',
  VALIDATION_FAILED: 'Those dates could not be saved. Check the selection and try again.',
};

export function availabilityErrorMessage(err: unknown, fallback = 'Could not save your changes. Please try again.'): string {
  const e = err as Partial<ApiError> | undefined;
  if (e?.code && CODE_MESSAGES[e.code]) return CODE_MESSAGES[e.code]!;
  if (e?.status === 404) return 'This listing could not be found.';
  if (e?.status === 429) return CODE_MESSAGES.RATE_LIMITED!;
  return e?.message || fallback;
}
