'use client';

// Request-to-book form: POST /api/bookings { listingId, startDate, endDate, guests, specialRequests? }.
// Only verified customer accounts can submit (the backend enforces it; we explain it up front).
// No payment step: customers arrange payment directly with the vendor.

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Clock, Info, Users } from 'lucide-react';
import { bookingsService } from '../../lib/api/endpoints';
import type { ApiError } from '../../lib/api/client';
import type { Booking } from '../../lib/types/booking';
import { useAuth, verifyEmailPath } from '../../lib/auth/auth.context';
import {
  bookingErrorMessage, dayCount, formatDateRange, formatTimestamp, todayInNairobi,
} from '../../lib/bookings/booking-ui';
import { AvailabilityCalendar, datesBetween } from './AvailabilityCalendar';
import { LoadingSpinner } from '../common/LoadingSpinner';

const GUESTS_MAX = 10_000;
const NOTES_MAX = 1000;

function Gate({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-bold text-gray-800 mb-1">{title}</p>
      <p className="text-xs text-gray-500 mb-3">{body}</p>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const primaryBtn = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink text-white text-xs font-bold no-underline hover:bg-ink-hover';
const secondaryBtn = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold no-underline hover:bg-gray-50';

export function BookingRequestForm({ listingId }: { listingId: string }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const today = useMemo(() => todayInNairobi(), []);
  const selfPath = `/store/${listingId}/book`;

  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [guests, setGuests] = useState('1');
  const [notes, setNotes] = useState('');
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; code?: string | undefined } | null>(null);
  const [created, setCreated] = useState<Booking | null>(null);
  const inFlight = useRef(false);

  const guestsNum = Number(guests);
  const errors = {
    dates: !start || !end ? 'Choose the dates you need.'
      : start < today ? 'The start date cannot be in the past.'
      : datesBetween(start, end).some((d) => unavailable.has(d)) ? 'Some of those dates are unavailable.'
      : dayCount(start, end) > 366 ? 'A booking cannot be longer than 366 days.'
      : null,
    guests: !Number.isInteger(guestsNum) || guestsNum < 1 ? 'Enter at least 1 guest.'
      : guestsNum > GUESTS_MAX ? `At most ${GUESTS_MAX.toLocaleString()} guests.`
      : null,
    notes: notes.length > NOTES_MAX ? `At most ${NOTES_MAX} characters.` : null,
  };
  const valid = !errors.dates && !errors.guests && !errors.notes;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || !start || !end || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await bookingsService.create({
        listingId, startDate: start, endDate: end, guests: guestsNum,
        ...(notes.trim() ? { specialRequests: notes.trim() } : {}),
      });
      setCreated(res.data);
    } catch (err) {
      const code = (err as ApiError).code;
      setServerError({ message: bookingErrorMessage(err, 'Could not send your request. Please try again.'), code });
      if (code === 'DATES_UNAVAILABLE') setRefreshKey((k) => k + 1);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="text-center py-6" role="status">
        <CheckCircle size={36} className="text-emerald-500 mx-auto mb-3" aria-hidden />
        <h2 className="text-lg font-black text-gray-900 mb-1">Request sent</h2>
        <p className="text-sm text-gray-600 mb-1">
          {formatDateRange(created.startDate, created.endDate)} · {created.guests.toLocaleString()} guest{created.guests === 1 ? '' : 's'}
        </p>
        <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
          {created.respondBy
            ? <>The vendor has until <strong>{formatTimestamp(created.respondBy)}</strong> to respond. We&apos;ll email you when they do.</>
            : 'The vendor has 24 hours to respond. We’ll email you when they do.'}
          {' '}There is nothing to pay now.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/customer/bookings/${created.id}`} className={primaryBtn}>View request</Link>
          <Link href={`/store/${listingId}`} className={secondaryBtn}>Back to listing</Link>
        </div>
      </div>
    );
  }

  let gate: React.ReactNode = null;
  if (isLoading) {
    gate = <LoadingSpinner text="Checking your account…" />;
  } else if (!isAuthenticated || !user) {
    gate = (
      <Gate title="Sign in to send a request" body="You need a customer account to request a booking. It's free.">
        <Link href={`/auth/login?redirect=${encodeURIComponent(selfPath)}`} className={primaryBtn}>Sign in</Link>
        <Link href="/auth/register" className={secondaryBtn}>Create an account</Link>
      </Gate>
    );
  } else if (user.role !== 'customer') {
    gate = (
      <Gate title="Customer accounts only"
        body={user.role === 'vendor'
          ? 'Vendor accounts cannot make bookings. To book another vendor, sign in with a separate customer account.'
          : 'Administrator accounts cannot make bookings.'} />
    );
  } else if (!user.emailVerified) {
    gate = (
      <Gate title="Verify your email first" body="Booking requests need a verified email address so the vendor can reach you.">
        <Link href={verifyEmailPath({ redirectTo: selfPath })} className={primaryBtn}>Verify email</Link>
      </Gate>
    );
  }

  const showErr = (k: keyof typeof errors) => touched && errors[k];

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <fieldset>
        <legend className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">1. Dates</legend>
        <AvailabilityCalendar
          listingId={listingId} today={today} start={start} end={end} refreshKey={refreshKey}
          onChange={(s, e) => { setStart(s); setEnd(e); setServerError(null); }}
          onUnavailable={setUnavailable}
        />
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs text-gray-700" aria-live="polite">
            {start && end
              ? <><strong>{formatDateRange(start, end)}</strong> · {dayCount(start, end)} day{dayCount(start, end) === 1 ? '' : 's'}</>
              : 'No dates selected'}
          </p>
          {start && (
            <button type="button" onClick={() => { setStart(null); setEnd(null); }} className="text-[11px] font-semibold text-gray-500 underline">
              Clear
            </button>
          )}
        </div>
        {showErr('dates') && <p className="mt-1.5 text-xs text-red-500" role="alert">{errors.dates}</p>}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">2. Details</legend>
        <div>
          <label htmlFor="guests" className="block text-xs font-semibold text-gray-700 mb-1.5">Number of guests</label>
          <div className="relative max-w-[180px]">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input id="guests" type="number" inputMode="numeric" min={1} max={GUESTS_MAX} step={1}
              value={guests} onChange={(e) => setGuests(e.target.value)} onBlur={() => setTouched(true)}
              aria-invalid={!!showErr('guests')}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
          </div>
          {showErr('guests') && <p className="mt-1.5 text-xs text-red-500" role="alert">{errors.guests}</p>}
        </div>
        <div>
          <label htmlFor="notes" className="block text-xs font-semibold text-gray-700 mb-1.5">
            Special requests <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea id="notes" rows={4} maxLength={NOTES_MAX} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Event type, timings, dietary needs, setup…"
            className="w-full resize-none px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
          <p className="text-[11px] text-gray-400 text-right">{notes.length}/{NOTES_MAX}</p>
        </div>
      </fieldset>

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5" role="alert">
          <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" aria-hidden />
          <div className="text-xs text-red-700">
            <p>{serverError.message}</p>
            {(serverError.code === 'DUPLICATE_REQUEST' || serverError.code === 'TOO_MANY_OPEN_REQUESTS') && (
              <Link href="/customer/bookings" className="font-bold underline">See my bookings</Link>
            )}
            {serverError.code === 'EMAIL_NOT_VERIFIED' && (
              <Link href={verifyEmailPath({ redirectTo: selfPath })} className="font-bold underline">Verify email</Link>
            )}
          </div>
        </div>
      )}

      {gate ?? (
        <>
          <button type="submit" disabled={submitting || (touched && !valid)}
            className="w-full py-3 rounded-xl bg-ink text-white text-sm font-black hover:bg-ink-hover disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Sending request…' : 'Send booking request'}
          </button>
          <ul className="space-y-1.5 text-[11px] text-gray-500">
            <li className="flex gap-1.5"><Clock size={12} className="shrink-0 mt-px" aria-hidden /> The vendor has 24 hours to accept or decline. Unanswered requests expire.</li>
            <li className="flex gap-1.5"><Info size={12} className="shrink-0 mt-px" aria-hidden /> Nothing is charged. Once accepted, you arrange payment directly with the vendor.</li>
          </ul>
        </>
      )}
    </form>
  );
}
