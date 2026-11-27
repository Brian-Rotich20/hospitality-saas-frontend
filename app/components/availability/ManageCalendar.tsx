'use client';

// Vendor-side month calendar. Shows open, blocked and booked days and lets the vendor pick
// an inclusive range (click a start day, then an end day). Data is loaded by the parent.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCalendarDate } from '../../lib/bookings/booking-ui';
import { dayState, type CalendarDays } from '../../lib/availability/availability-ui';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

export interface MonthView { y: number; m: number }

interface Props {
  days: CalendarDays;
  today: string;
  lastDay: string;
  view: MonthView;
  onViewChange: (v: MonthView) => void;
  start: string | null;
  end: string | null;
  onPick: (d: string) => void;
  disabled?: boolean;
}

const STATE_LABEL = { open: 'available', blocked: 'blocked', booked: 'booked' } as const;

export function ManageCalendar({ days, today, lastDay, view, onViewChange, start, end, onPick, disabled }: Props) {
  const ty = Number(today.slice(0, 4));
  const tm = Number(today.slice(5, 7)) - 1;
  const ly = Number(lastDay.slice(0, 4));
  const lm = Number(lastDay.slice(5, 7)) - 1;
  const atFirst = view.y === ty && view.m === tm;
  const atLast = view.y === ly && view.m === lm;

  const move = (delta: number) => {
    const m = view.m + delta;
    onViewChange({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  const lead = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7; // Monday-first
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysIn(view.y, view.m) }, (_, i) => ymd(view.y, view.m, i + 1)),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => move(-1)} disabled={atFirst} aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={15} aria-hidden />
        </button>
        <h2 className="text-sm font-bold text-gray-900" aria-live="polite">
          {formatCalendarDate(ymd(view.y, view.m, 1), 'MMMM yyyy')}
        </h2>
        <button type="button" onClick={() => move(1)} disabled={atLast} aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={15} aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1.5" aria-hidden>
        {WEEKDAYS.map((w) => <span key={w} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{w}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const state = dayState(days, d);
          const outside = d < today || d > lastDay;
          const inRange = !!start && !!end && d >= start && d <= end;
          const edge = d === start || d === end;
          const label = `${formatCalendarDate(d, 'EEEE d MMMM yyyy')}, ${outside ? 'not editable' : STATE_LABEL[state]}`;
          const tone = edge
            ? 'bg-ink text-white'
            : inRange
              ? state === 'booked' ? 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-ink' : 'bg-ink/15 text-ink'
              : outside ? 'text-gray-300'
              : state === 'blocked' ? 'bg-gray-200 text-gray-500 line-through decoration-gray-400 hover:bg-gray-300'
              : state === 'booked' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'text-gray-700 hover:bg-gray-100';
          return (
            <button key={d} type="button" disabled={outside || disabled} onClick={() => onPick(d)}
              aria-label={label} aria-pressed={inRange}
              className={`h-10 sm:h-11 rounded-lg text-xs font-semibold tabular-nums transition-colors disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${tone}
                ${d === today && !edge ? 'ring-1 ring-gray-300' : ''}`}>
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[11px] text-gray-500" aria-label="Legend">
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-200 bg-white" aria-hidden /> Available</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200" aria-hidden /> Blocked by you</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" aria-hidden /> Booked</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-ink" aria-hidden /> Selected</li>
      </ul>
    </div>
  );
}
