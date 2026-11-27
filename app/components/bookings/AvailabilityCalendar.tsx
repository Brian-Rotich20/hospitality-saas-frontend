'use client';

// Month calendar showing a listing's unavailable dates (GET /listings/:id/calendar) and
// letting the customer pick an inclusive date range. Dates are YYYY-MM-DD strings
// throughout (Africa/Nairobi calendar), so nothing shifts with the browser's time zone.

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { availabilityService } from '../../lib/api/endpoints';
import { formatCalendarDate } from '../../lib/bookings/booking-ui';

type DayInfo = { available: boolean; reason?: string };

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** Every date from start to end inclusive (string arithmetic via UTC). */
export function datesBetween(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  while (d <= e && out.length < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

interface Props {
  listingId: string;
  today: string;
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  /** Tells the parent which dates are known to be unavailable (for validation). */
  onUnavailable?: (dates: Set<string>) => void;
  /** Bump to re-fetch (e.g. after the server reports a date clash). */
  refreshKey?: number;
}

export function AvailabilityCalendar({ listingId, today, start, end, onChange, onUnavailable, refreshKey = 0 }: Props) {
  const [ty, tm] = [Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1];
  const [view, setView] = useState({ y: ty, m: tm });
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);
  const [picking, setPicking] = useState(false);
  const monthKey = `${view.y}-${pad(view.m + 1)}`;

  // A refresh invalidates every cached month.
  useEffect(() => { setLoaded(new Set()); setDays({}); }, [refreshKey]);

  // Vendors can block dates (or accept another request) while this page is open: re-load
  // when the customer comes back to the tab so the calendar reflects current availability.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') setLoaded(new Set()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const loadMonth = useCallback(async (y: number, m: number) => {
    const key = `${y}-${pad(m + 1)}`;
    setError(false);
    try {
      const res = await availabilityService.getCalendar(listingId, ymd(y, m, 1), ymd(y, m, daysIn(y, m)));
      const data = (res.data ?? {}) as Record<string, DayInfo>;
      // Replace this month's entries so days unblocked since the last load become selectable.
      setDays((prev) => {
        const next: Record<string, DayInfo> = {};
        for (const [d, v] of Object.entries(prev)) if (!d.startsWith(key)) next[d] = v;
        return { ...next, ...data };
      });
      setLoaded((prev) => new Set(prev).add(key));
    } catch {
      setError(true);
    }
  }, [listingId]);

  useEffect(() => {
    if (!loaded.has(monthKey)) void loadMonth(view.y, view.m);
  }, [loaded, monthKey, view, loadMonth]);

  useEffect(() => {
    onUnavailable?.(new Set(Object.entries(days).filter(([, v]) => !v.available).map(([k]) => k)));
  }, [days, onUnavailable]);

  const unavailable = (d: string) => days[d]?.available === false;
  const isPast = (d: string) => d < today;

  const select = (d: string) => {
    if (picking && start && d >= start) {
      const clash = datesBetween(start, d).some(unavailable);
      if (clash) { onChange(d, d); setPicking(true); return; }
      onChange(start, d);
      setPicking(false);
      return;
    }
    onChange(d, d);
    setPicking(true);
  };

  const move = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };
  const atFirstMonth = view.y === ty && view.m === tm;
  // Browse up to 12 months ahead.
  const atLastMonth = (view.y - ty) * 12 + (view.m - tm) >= 12;

  const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay(); // 0 = Sunday
  const lead = (first + 6) % 7; // Monday-first grid
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysIn(view.y, view.m) }, (_, i) => ymd(view.y, view.m, i + 1)),
  ];
  const monthLoading = !loaded.has(monthKey) && !error;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => move(-1)} disabled={atFirstMonth}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={16} aria-hidden />
        </button>
        <p className="text-sm font-bold text-gray-800" aria-live="polite">
          {formatCalendarDate(ymd(view.y, view.m, 1), 'MMMM yyyy')}
        </p>
        <button type="button" onClick={() => move(1)} disabled={atLastMonth}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1" aria-hidden>
        {WEEKDAYS.map((w) => <span key={w} className="text-[10px] font-bold text-gray-400 uppercase">{w}</span>)}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${monthLoading ? 'opacity-50' : ''}`} aria-busy={monthLoading}>
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const off = isPast(d) || unavailable(d);
          const inRange = !!start && !!end && d >= start && d <= end;
          const edge = d === start || d === end;
          const label = `${formatCalendarDate(d, 'EEEE d MMMM yyyy')}${unavailable(d) ? `, ${days[d]?.reason ?? 'unavailable'}` : ''}${isPast(d) ? ', past' : ''}`;
          return (
            <button key={d} type="button" disabled={off || monthLoading} onClick={() => select(d)}
              aria-label={label} aria-pressed={inRange}
              className={`h-9 rounded-lg text-xs font-semibold transition-colors
                ${edge ? 'bg-ink text-white'
                  : inRange ? 'bg-ink/15 text-ink'
                  : unavailable(d) ? 'bg-red-50 text-red-300 line-through cursor-not-allowed'
                  : isPast(d) ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'}
                ${d === today && !edge ? 'ring-1 ring-gray-300' : ''}`}>
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-ink" aria-hidden /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-50 border border-red-100" aria-hidden /> Unavailable</span>
        {picking && start && <span className="text-gray-400">Pick an end date, or keep a single day.</span>}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          Could not load availability for this month.{' '}
          <button type="button" className="underline font-semibold" onClick={() => void loadMonth(view.y, view.m)}>Retry</button>
        </p>
      )}
    </div>
  );
}
