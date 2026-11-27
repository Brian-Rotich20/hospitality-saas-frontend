'use client';

// Vendor availability for one listing: block and unblock dates for the next 12 months.
// Contract: GET /listings/:id/calendar, POST /listings/:id/block, POST /listings/:id/unblock
// (backend/docs/api/API-REFERENCE.md §6). Accepted bookings hold their dates and cannot be blocked.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { availabilityService, listingsService } from '../../../../../lib/api/endpoints';
import type { ApiError } from '../../../../../lib/api/client';
import { todayInNairobi } from '../../../../../lib/bookings/booking-ui';
import { datesBetween } from '../../../../../components/bookings/AvailabilityCalendar';
import { ManageCalendar, type MonthView } from '../../../../../components/availability/ManageCalendar';
import {
  BLOCK_REASON_MAX, WINDOW_DAYS, addDaysYmd, availabilityErrorMessage, dayState, rangeLabel, toRanges,
  type CalendarDays,
} from '../../../../../lib/availability/availability-ui';

interface ListingInfo { id: string; title: string; status: string }

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function ListingAvailabilityPage() {
  const { id } = useParams<{ id: string }>();
  const today = useMemo(() => todayInNairobi(), []);
  const lastDay = useMemo(() => addDaysYmd(today, WINDOW_DAYS), [today]);

  const [listing, setListing] = useState<ListingInfo | null>(null);
  const [days, setDays] = useState<CalendarDays>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [view, setView] = useState<MonthView>({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 });
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const loadCalendar = useCallback(async () => {
    const res = await availabilityService.getCalendar(id, today, lastDay);
    setDays((res.data ?? {}) as CalendarDays);
  }, [id, today, lastDay]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [l] = await Promise.all([listingsService.getById(id), loadCalendar()]);
      const data = l.data as unknown as ListingInfo;
      setListing({ id: data.id, title: data.title, status: data.status });
    } catch (err) {
      const e = err as ApiError;
      setLoadError({
        notFound: e.status === 404 || e.status === 400 || e.status === 422,
        message: e.status === 404 || e.status === 400 || e.status === 422 ? 'Listing not found' : 'Could not load availability.',
      });
    } finally {
      setLoading(false);
    }
  }, [id, loadCalendar]);

  useEffect(() => { void load(); }, [load]);

  const clearSelection = useCallback(() => { setStart(null); setEnd(null); setPicking(false); setActionError(null); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !inFlight.current) clearSelection(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearSelection]);

  const pick = (d: string) => {
    setActionError(null);
    if (picking && start && d >= start) { setEnd(d); setPicking(false); return; }
    setStart(d); setEnd(d); setPicking(true);
  };

  const selection = useMemo(() => (start && end ? datesBetween(start, end) : []), [start, end]);
  const selOpen = selection.filter((d) => dayState(days, d) === 'open');
  const selBlocked = selection.filter((d) => dayState(days, d) === 'blocked');
  const selBooked = selection.filter((d) => dayState(days, d) === 'booked');

  const blockedRanges = useMemo(
    () => toRanges(Object.keys(days).filter((d) => dayState(days, d) === 'blocked')), [days]);
  const bookedCount = useMemo(() => Object.keys(days).filter((d) => dayState(days, d) === 'booked').length, [days]);

  const run = async (key: string, call: () => Promise<unknown>, success: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(key);
    setActionError(null);
    try {
      await call();
      toast.success(success);
      clearSelection();
      setReason('');
    } catch (err) {
      const e = err as ApiError;
      let message = availabilityErrorMessage(err);
      const clash = e.code === 'DATES_BOOKED' && e.details && !Array.isArray(e.details) ? e.details.dates : undefined;
      if (clash?.length) message = `${message} Booked: ${toRanges(clash).map((r) => rangeLabel(r.start, r.end)).join(', ')}.`;
      setActionError(message);
    } finally {
      // The server is the source of truth (a booking may have been accepted meanwhile).
      try { await loadCalendar(); } catch { /* keep the current view; the next action re-syncs */ }
      inFlight.current = false;
      setBusy(null);
    }
  };

  const block = () => {
    const trimmed = reason.trim();
    void run('block', () => availabilityService.blockDates(id, selOpen, trimmed || undefined),
      `${plural(selOpen.length, 'day')} blocked`);
  };
  const unblock = (dates: string[], key: string) =>
    void run(key, () => availabilityService.unblockDates(id, dates), `${plural(dates.length, 'day')} unblocked`);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto" aria-busy="true">
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse mb-5" />
        <div className="h-7 w-48 rounded bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-gray-100 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          <div className="h-[420px] rounded-2xl bg-white border border-gray-200" />
          <div className="h-[260px] rounded-2xl bg-white border border-gray-200" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-lg font-bold text-gray-900 mb-1">{loadError.message}</h1>
        <p className="text-sm text-gray-500 mb-5">
          {loadError.notFound ? 'It may have been deleted, or it belongs to another account.' : 'Check your connection and try again.'}
        </p>
        <div className="flex justify-center gap-2">
          {!loadError.notFound && (
            <button onClick={() => void load()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-white text-xs font-bold hover:bg-ink-hover">
              <RefreshCw size={13} aria-hidden /> Retry
            </button>
          )}
          <Link href="/vendor/listings" className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const hasSelection = selection.length > 0;
  const working = busy !== null;

  return (
    <div className="max-w-[1000px] mx-auto">
      <Link href={`/vendor/listings/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={13} aria-hidden /> {listing?.title ?? 'Listing'}
      </Link>

      <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-1">Availability</h1>
      <p className="text-[13px] text-gray-500 mb-5 max-w-[62ch]">
        Block the days you can&apos;t take bookings. Customers see blocked days as unavailable; your reason stays private.
        Booked days are held by accepted bookings.
      </p>

      {listing && listing.status !== 'active' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-5">
          This listing is {listing.status === 'paused' ? 'paused' : 'a draft'}, so customers can&apos;t see it yet. The dates you block here apply once it is published.
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6" aria-label="Calendar">
          <ManageCalendar days={days} today={today} lastDay={lastDay} view={view} onViewChange={setView}
            start={start} end={end} onPick={pick} disabled={working} />
        </section>

        <div className="space-y-5">
          <section className="bg-white border border-gray-200 rounded-2xl p-5" aria-labelledby="sel-heading" aria-live="polite">
            <h2 id="sel-heading" className="text-sm font-bold text-gray-900 mb-1">
              {hasSelection ? rangeLabel(start!, end!) : 'Select dates'}
            </h2>

            {!hasSelection ? (
              <p className="text-xs text-gray-500 leading-relaxed">
                Click a day, or a first and last day, on the calendar. You can block available days and unblock blocked ones.
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  {[
                    selOpen.length && `${plural(selOpen.length, 'available day')}`,
                    selBlocked.length && `${selBlocked.length} blocked`,
                    selBooked.length && `${selBooked.length} booked`,
                  ].filter(Boolean).join(' · ')}
                  {picking && ' — pick a last day, or keep this one.'}
                </p>

                {selBooked.length > 0 && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
                    Booked days stay booked. To free them, cancel the booking from{' '}
                    <Link href="/vendor/bookings" className="font-bold underline">Bookings</Link>.
                  </p>
                )}

                {selOpen.length > 0 && (
                  <div className="mb-3">
                    <label htmlFor="block-reason" className="block text-[11px] font-bold text-gray-600 mb-1">
                      Note for yourself <span className="font-normal text-gray-400">(optional, private)</span>
                    </label>
                    <input id="block-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={BLOCK_REASON_MAX}
                      placeholder="e.g. Private event"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
                    <button type="button" onClick={block} disabled={working}
                      className="mt-3 w-full py-2.5 rounded-xl bg-ink text-white text-xs font-bold hover:bg-ink-hover disabled:opacity-60 disabled:cursor-not-allowed">
                      {busy === 'block' ? 'Blocking…' : `Block ${plural(selOpen.length, 'day')}`}
                    </button>
                  </div>
                )}

                {selBlocked.length > 0 && (
                  <button type="button" onClick={() => unblock(selBlocked, 'unblock-sel')} disabled={working}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed">
                    {busy === 'unblock-sel' ? 'Unblocking…' : `Unblock ${plural(selBlocked.length, 'day')}`}
                  </button>
                )}

                <button type="button" onClick={clearSelection} disabled={working}
                  className="mt-2 w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50">
                  Clear selection
                </button>
              </>
            )}

            {actionError && (
              <p role="alert" className="mt-3 flex gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0 mt-px" aria-hidden /> {actionError}
              </p>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-5" aria-labelledby="blocked-heading">
            <div className="flex items-baseline justify-between mb-3">
              <h2 id="blocked-heading" className="text-sm font-bold text-gray-900">Blocked dates</h2>
              <span className="text-[11px] text-gray-400 tabular-nums">
                {bookedCount > 0 ? `${plural(bookedCount, 'day')} booked` : 'Next 12 months'}
              </span>
            </div>
            {blockedRanges.length === 0 ? (
              <p className="text-xs text-gray-500">Nothing blocked. Every day without a booking can be requested.</p>
            ) : (
              <ul className="divide-y divide-gray-100 -my-1">
                {blockedRanges.map((r) => {
                  const key = `range-${r.start}`;
                  return (
                    <li key={r.start} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{rangeLabel(r.start, r.end)}</p>
                        <p className="text-[11px] text-gray-400">{plural(r.dates.length, 'day')}</p>
                      </div>
                      <button type="button" onClick={() => unblock(r.dates, key)} disabled={working}
                        aria-label={`Unblock ${rangeLabel(r.start, r.end)}`}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                        {busy === key ? 'Unblocking…' : 'Unblock'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
