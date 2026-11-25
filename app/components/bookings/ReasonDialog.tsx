'use client';

// Modal that collects the reason the backend requires for declining or cancelling (10–500 chars).

import { useEffect, useId, useRef, useState } from 'react';
import { REASON_MAX, REASON_MIN } from '../../lib/bookings/booking-ui';

interface Props {
  title: string;
  description: string;
  placeholder?: string;
  confirmLabel: string;
  busyLabel: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ReasonDialog({ title, description, placeholder, confirmLabel, busyLabel, busy, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const descId = useId();
  const trimmed = reason.trim();
  const valid = trimmed.length >= REASON_MIN && trimmed.length <= REASON_MAX;

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id={titleId} className="text-base font-bold text-gray-900 mb-1">{title}</h2>
        <p id={descId} className="text-[13px] text-gray-500 mb-4">{description}</p>

        <form onSubmit={(e) => { e.preventDefault(); if (valid && !busy) onConfirm(trimmed); }}>
          <label className="sr-only" htmlFor={`${titleId}-reason`}>Reason</label>
          <textarea
            id={`${titleId}-reason`}
            ref={ref}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={REASON_MAX}
            rows={4}
            placeholder={placeholder}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
          <p className={`mt-1 text-[11px] ${trimmed.length > 0 && trimmed.length < REASON_MIN ? 'text-red-500' : 'text-gray-400'}`}>
            {trimmed.length < REASON_MIN
              ? `At least ${REASON_MIN} characters (${trimmed.length}/${REASON_MIN})`
              : `${trimmed.length}/${REASON_MAX}`}
          </p>

          <div className="mt-4 flex gap-2.5">
            <button type="button" onClick={onClose} disabled={busy}
              className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Keep booking
            </button>
            <button type="submit" disabled={!valid || busy}
              className="flex-1 rounded-lg bg-red-500 py-2.5 text-[13px] font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300">
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
