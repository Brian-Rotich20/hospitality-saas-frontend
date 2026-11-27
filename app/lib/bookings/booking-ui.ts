// Shared booking presentation rules (statuses, dates, permitted actions, error copy).
// Mirrors the backend contract in backend/docs/api/API-REFERENCE.md §7: request-to-book,
// no money on bookings, a 24-hour vendor deadline.

import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import type { ApiError } from '../api/client';
import type { BookingStatus } from '../types/booking';

export const BOOKING_STATUSES: BookingStatus[] = ['requested', 'accepted', 'declined', 'expired', 'cancelled', 'completed'];

interface StatusMeta {
  label: string;
  /** Tailwind classes for chips. */
  chip: string;
  dot: string;
  /** Hex colours for pages styled inline. */
  hex: { bg: string; fg: string; dot: string };
  customerHint: string;
  vendorHint: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  requested: {
    label: 'Awaiting reply', chip: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400',
    hex: { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
    customerHint: 'The vendor has 24 hours to accept or decline your request.',
    vendorHint: 'Accept or decline before the deadline, or the request expires.',
  },
  accepted: {
    label: 'Accepted', chip: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500',
    hex: { bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
    customerHint: 'Confirmed by the vendor. Contact them to arrange payment and details.',
    vendorHint: 'You accepted this booking. The dates are now reserved.',
  },
  declined: {
    label: 'Declined', chip: 'bg-red-50 text-red-600 border border-red-200', dot: 'bg-red-400',
    hex: { bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
    customerHint: 'The vendor could not take this booking.',
    vendorHint: 'You declined this request.',
  },
  expired: {
    label: 'Expired', chip: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400',
    hex: { bg: '#F3F4F6', fg: '#4B5563', dot: '#9CA3AF' },
    customerHint: 'The vendor did not reply within 24 hours. You can send a new request.',
    vendorHint: 'This request expired because it was not answered within 24 hours.',
  },
  cancelled: {
    label: 'Cancelled', chip: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400',
    hex: { bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
    customerHint: 'This booking was cancelled.',
    vendorHint: 'This booking was cancelled.',
  },
  completed: {
    label: 'Completed', chip: 'bg-violet-50 text-violet-700 border border-violet-200', dot: 'bg-violet-500',
    hex: { bg: '#EDE9FE', fg: '#5B21B6', dot: '#8B5CF6' },
    customerHint: 'This booking is complete. You can leave a review on the listing.',
    vendorHint: 'This booking is complete.',
  },
};

/** Unknown statuses (should not happen) fall back to a neutral chip instead of crashing. */
export function statusMeta(status: string): StatusMeta {
  return BOOKING_STATUS_META[status as BookingStatus] ?? {
    ...BOOKING_STATUS_META.cancelled, label: status,
  };
}

/** Today's calendar date in Africa/Nairobi (the backend's business time zone), YYYY-MM-DD. */
export function todayInNairobi(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Formats a YYYY-MM-DD calendar date without time-zone shifts. */
export function formatCalendarDate(ymd: string, pattern = 'd MMM yyyy'): string {
  const d = parseISO(ymd);
  return Number.isNaN(d.getTime()) ? ymd : format(d, pattern);
}

export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatCalendarDate(start, 'EEE d MMM yyyy');
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${formatCalendarDate(start, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${formatCalendarDate(end)}`;
}

/** Inclusive number of days in a booking range. */
export function dayCount(start: string, end: string): number {
  const ms = parseISO(end).getTime() - parseISO(start).getTime();
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) + 1 : 0;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : format(d, 'd MMM yyyy, HH:mm');
}

/** "in 5 hours" style deadline; null when there is no deadline or it has passed. */
export function deadlineLabel(respondBy: string | null, now: Date = new Date()): string | null {
  if (!respondBy) return null;
  const d = new Date(respondBy);
  if (Number.isNaN(d.getTime()) || d <= now) return null;
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

/** The backend allows cancelling before the start date only (BOOKING_STARTED). */
function beforeStart(startDate: string) {
  return startDate > todayInNairobi();
}

/** Customers may cancel requested or accepted bookings before the start date. */
export function customerCanCancel(b: { status: BookingStatus; startDate: string }) {
  return (b.status === 'requested' || b.status === 'accepted') && beforeStart(b.startDate);
}

/** Vendors may cancel accepted bookings before the start date (requests are declined instead). */
export function vendorCanCancel(b: { status: BookingStatus; startDate: string }) {
  return b.status === 'accepted' && beforeStart(b.startDate);
}

/** A request can be answered while it is `requested` and the deadline has not passed. */
export function vendorCanRespond(b: { status: BookingStatus; respondBy: string | null }, now: Date = new Date()) {
  return b.status === 'requested' && (!b.respondBy || new Date(b.respondBy) > now);
}

export const REASON_MIN = 10;
export const REASON_MAX = 500;

const CODE_MESSAGES: Record<string, string> = {
  DATES_UNAVAILABLE:      'Those dates are no longer available. Please choose different dates.',
  DUPLICATE_REQUEST:      'You already have an open request for these dates.',
  TOO_MANY_OPEN_REQUESTS: 'You have 5 open requests. Wait for vendors to reply, or cancel one, before sending another.',
  OWN_LISTING:            'You cannot book your own listing.',
  CUSTOMERS_ONLY:         'Only customer accounts can request bookings.',
  EMAIL_NOT_VERIFIED:     'Please verify your email address first.',
  REQUEST_EXPIRED:        'This request has expired. The 24-hour response window has passed.',
  INVALID_TRANSITION:     'This booking has changed. Refresh to see its current status.',
  BOOKING_STARTED:        'Bookings cannot be cancelled on or after the start date.',
  SUBSCRIPTION_INACTIVE:  'Your subscription is inactive. Renew it to accept booking requests.',
  VENDOR_SUSPENDED:       'Your vendor account is suspended.',
  RATE_LIMITED:           'Too many attempts. Please wait a minute and try again.',
  NOT_FOUND:              'This booking could not be found.',
};

/** User-facing copy for a failed booking call; backend 4xx messages are used when no specific copy exists. */
export function bookingErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as Partial<ApiError> | undefined;
  if (e?.code && CODE_MESSAGES[e.code]) return CODE_MESSAGES[e.code]!;
  if (e?.status === 404) return CODE_MESSAGES.NOT_FOUND!;
  if (e?.status === 429) return CODE_MESSAGES.RATE_LIMITED!;
  return e?.message || fallback;
}
