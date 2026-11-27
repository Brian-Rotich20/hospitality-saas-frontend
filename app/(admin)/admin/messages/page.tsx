'use client';

// Message moderation. GET /admin/messages/reports (open reports, oldest first) and
// POST /admin/messages/:messageId/moderate { action: 'hide' | 'dismiss' } (audited).
// Hiding withholds the text from both parties; there is no endpoint to undo it.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { adminModerationService } from '../../../lib/api/endpoints';
import type { MessageReport } from '../../../lib/types/messaging';
import { formatTimestamp } from '../../../lib/bookings/booking-ui';

export default function AdminMessageReportsPage() {
  const [reports, setReports] = useState<MessageReport[] | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmHide, setConfirmHide] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await adminModerationService.reports();
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Several people can report the same message: moderate it once.
  const grouped = useMemo(() => {
    const map = new Map<string, { message: MessageReport['message']; reports: MessageReport['report'][] }>();
    for (const r of reports ?? []) {
      const g = map.get(r.message.id) ?? { message: r.message, reports: [] };
      g.reports.push(r.report);
      map.set(r.message.id, g);
    }
    return [...map.values()];
  }, [reports]);

  const moderate = async (messageId: string, action: 'hide' | 'dismiss') => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(messageId);
    try {
      await adminModerationService.moderate(messageId, action);
      toast.success(action === 'hide' ? 'Message hidden' : 'Report dismissed');
      setConfirmHide(null);
      await load();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not update the report.');
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  return (
    <div className="max-w-[860px]">
      <h1 className="text-2xl font-black text-text-primary tracking-tight mb-1">Message reports</h1>
      <p className="text-sm text-text-muted mb-6">
        Messages reported by customers or vendors. Hiding removes the text for both people and cannot be undone; dismissing keeps it.
      </p>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4 text-sm text-red-800">
          <span className="flex items-center gap-2"><AlertCircle size={14} aria-hidden /> Could not load reports.</span>
          <button onClick={() => void load()} className="flex items-center gap-1 text-xs font-bold"><RefreshCw size={12} aria-hidden /> Retry</button>
        </div>
      )}

      {reports === null && !error ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1].map((i) => <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />)}
        </div>
      ) : grouped.length === 0 && !error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-semibold text-text-primary mb-1">No open reports</p>
          <p className="text-xs text-text-muted">Reported messages appear here for review.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {grouped.map(({ message, reports: rs }) => (
            <li key={message.id} className="rounded-xl border border-border bg-card p-5">
              <blockquote className="text-[13px] text-text-primary whitespace-pre-wrap break-words border border-border bg-page rounded-lg px-3.5 py-2.5 mb-3">
                {message.body}
              </blockquote>
              <div className="mb-4">
                <p className="text-[11px] font-bold text-text-muted mb-1.5">
                  {rs.length === 1 ? 'Reason given' : `${rs.length} reports`}
                </p>
                <ul className="space-y-1">
                  {rs.map((r) => (
                    <li key={r.id} className="text-xs text-text-secondary">
                      “{r.reason}” <span className="text-text-muted">· {formatTimestamp(r.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/messages/${message.conversationId}`}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-bold text-text-secondary no-underline hover:border-text-muted">
                  Read conversation
                </Link>
                <div className="flex-1" />
                <button onClick={() => void moderate(message.id, 'dismiss')} disabled={busy !== null}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-bold text-text-secondary hover:border-text-muted disabled:opacity-50">
                  Dismiss
                </button>
                {confirmHide === message.id ? (
                  <>
                    <button onClick={() => setConfirmHide(null)} disabled={busy !== null}
                      className="px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-primary">Keep</button>
                    <button onClick={() => void moderate(message.id, 'hide')} disabled={busy !== null}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60">
                      {busy === message.id ? 'Hiding…' : 'Confirm: hide message'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setConfirmHide(message.id)} disabled={busy !== null || message.hiddenAt !== null}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 disabled:opacity-50">
                    {message.hiddenAt ? 'Already hidden' : 'Hide message'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
