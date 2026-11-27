'use client';

// One conversation. Contract: GET /conversations/:id/messages (?after= for polling every
// 5–10 s while open), POST /conversations/:id/messages { body 1–2000 } (409 CONVERSATION_CLOSED,
// 20/min), POST /messages/:id/report { reason 5–500 } (409 OWN_MESSAGE). Admins read only.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft, Lock, RefreshCw, Send } from 'lucide-react';
import { messagingService } from '../../../lib/api/endpoints';
import type { ApiError } from '../../../lib/api/client';
import { useAuth } from '../../../lib/auth/auth.context';
import { markSeen, useConversations } from '../../../lib/messaging/unread';
import { MESSAGE_MAX, REPORT_MAX, REPORT_MIN, type Message } from '../../../lib/types/messaging';
import { ConversationList, counterpartName, useBookingIndex } from '../../../components/messaging/ConversationList';
import { ReasonDialog } from '../../../components/bookings/ReasonDialog';

const POLL_MS = 7_000;

function sendErrorMessage(err: unknown): string {
  const e = err as Partial<ApiError>;
  if (e.code === 'CONVERSATION_CLOSED') return 'This conversation is closed. New messages can no longer be sent.';
  if (e.status === 429) return 'You are sending messages too quickly. Wait a moment and try again.';
  if (e.status === 403) return 'You can read this conversation but not post in it.';
  return e.message || 'Your message was not sent. Please try again.';
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const inbox = useConversations(!isAdmin, 30_000);
  const index = useBookingIndex(!isAdmin);
  const summary = inbox.items?.find((c) => c.id === id);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [writable, setWritable] = useState(false);
  const [loadError, setLoadError] = useState<'not_found' | 'failed' | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const latest = useRef<string | undefined>(undefined);

  const merge = useCallback((incoming: Message[]) => {
    setMessages((prev) => {
      const map = new Map((prev ?? []).map((m) => [m.id, m]));
      for (const m of incoming) map.set(m.id, m);
      const next = [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      latest.current = next[next.length - 1]?.createdAt ?? latest.current;
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await messagingService.messages(id);
      latest.current = undefined;
      setMessages(null);
      merge(res.data.messages);
      setWritable(res.data.writable);
    } catch (err) {
      const e = err as ApiError;
      setLoadError(e.status === 404 || e.status === 400 || e.status === 422 ? 'not_found' : 'failed');
    }
  }, [id, merge]);

  useEffect(() => { void load(); }, [load]);

  // Poll for new messages while the tab is visible.
  useEffect(() => {
    if (loadError) return;
    const tick = async () => {
      if (document.visibilityState !== 'visible' || messages === null) return;
      try {
        const res = await messagingService.messages(id, latest.current);
        if (res.data.messages.length) merge(res.data.messages);
        setWritable(res.data.writable);
      } catch { /* transient; the next tick retries */ }
    };
    const t = window.setInterval(() => void tick(), POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, [id, loadError, merge, messages]);

  // Everything on screen counts as seen. The backend stamps lastMessageAt with the app clock
  // and messages with the database clock, so lastMessageAt can be a few ms later than the
  // newest message: mark up to whichever is later, or the dot would never clear.
  useEffect(() => {
    if (messages === null) return;
    const last = messages[messages.length - 1]?.createdAt;
    const conv = summary?.lastMessageAt ?? undefined;
    const upTo = [last, conv].filter(Boolean).sort().pop();
    markSeen(id, upTo);
  }, [id, messages, summary?.lastMessageAt]);

  // Keep the view pinned to the newest message unless the user scrolled up.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const trimmed = draft.trim();
  const send = async () => {
    if (!trimmed || trimmed.length > MESSAGE_MAX || inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setSendError(null);
    try {
      const res = await messagingService.send(id, trimmed);
      stick.current = true;
      merge([{ id: res.data.id, body: res.data.body, createdAt: res.data.createdAt, mine: true, hidden: false,
        senderRole: user?.role === 'vendor' ? 'vendor' : 'customer' }]);
      setDraft('');
      void inbox.refresh();
    } catch (err) {
      setSendError(sendErrorMessage(err));
      if ((err as ApiError).code === 'CONVERSATION_CLOSED') setWritable(false);
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  const report = async (reason: string) => {
    if (!reportTarget || reporting) return;
    setReporting(true);
    setReportError(null);
    try {
      await messagingService.report(reportTarget, reason);
      toast.success('Thanks. A moderator will review this message.');
      setReportTarget(null);
    } catch (err) {
      const e = err as ApiError;
      setReportError(e.code === 'OWN_MESSAGE' ? 'You cannot report your own message.' : e.message || 'Could not send the report.');
    } finally {
      setReporting(false);
    }
  };

  const bookingHref = summary
    ? user?.role === 'vendor' ? `/vendor/bookings/${summary.bookingId}` : `/customer/bookings/${summary.bookingId}`
    : null;
  const title = summary ? counterpartName(summary, index[summary.bookingId], user?.role) : 'Conversation';
  const otherSide = user?.role === 'vendor' ? 'customer' : 'vendor';

  return (
    <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-5 lg:h-[calc(100vh-56px-48px)]">
      {!isAdmin && (
        <aside className="hidden lg:flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-0" aria-label="Conversations">
          <h2 className="px-4 py-3 text-sm font-bold text-gray-900 border-b border-gray-100">Messages</h2>
          <div className="overflow-y-auto min-h-0">
            <ConversationList items={inbox.items} error={inbox.error} onRetry={() => void inbox.refresh()} activeId={id} index={index} />
          </div>
        </aside>
      )}

      <section className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden h-[calc(100dvh-56px-32px)] md:h-[calc(100dvh-56px-48px)] lg:h-auto min-h-0 ${isAdmin ? 'lg:col-span-2' : ''}`}>
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Link href={isAdmin ? '/admin/messages' : '/messages'} aria-label="Back to messages"
            className={`w-8 h-8 -ml-1 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 ${isAdmin ? '' : 'lg:hidden'}`}>
            <ArrowLeft size={16} aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-gray-900 truncate">{title}</h1>
            {summary && (
              <p className="text-xs text-gray-500 truncate">
                {summary.listingTitle}{index[summary.bookingId]?.dates ? ` · ${index[summary.bookingId]!.dates}` : ''}
              </p>
            )}
          </div>
          {bookingHref && (
            <Link href={bookingHref} className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 no-underline">
              View booking
            </Link>
          )}
        </header>

        <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-4 min-h-0" aria-live="polite" aria-label="Messages">
          {loadError === 'not_found' ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-gray-800 mb-1">Conversation not found</p>
              <p className="text-xs text-gray-500 mb-4">It may belong to another account.</p>
              <Link href="/messages" className="text-xs font-bold underline">Back to messages</Link>
            </div>
          ) : loadError === 'failed' ? (
            <div role="alert" className="text-center py-16">
              <p className="flex items-center justify-center gap-1.5 text-sm text-red-700 mb-3"><AlertCircle size={14} aria-hidden /> Could not load messages.</p>
              <button onClick={() => void load()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink text-white text-xs font-bold">
                <RefreshCw size={12} aria-hidden /> Retry
              </button>
            </div>
          ) : messages === null ? (
            <div className="space-y-3" aria-busy="true">
              <div className="h-9 w-2/3 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-9 w-1/2 rounded-2xl bg-gray-100 animate-pulse ml-auto" />
              <div className="h-9 w-3/5 rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-16 max-w-[40ch] mx-auto">
              {writable
                ? `No messages yet. Say hello and confirm the details of the booking with the ${otherSide}.`
                : 'No messages were sent in this conversation.'}
            </p>
          ) : (
            <ol className="space-y-1.5">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const newDay = !prev || !isSameDay(new Date(prev.createdAt), new Date(m.createdAt));
                const mine = isAdmin ? m.senderRole === 'vendor' : m.mine;
                return (
                  <li key={m.id}>
                    {newDay && (
                      <p className="text-center text-[11px] font-semibold text-gray-400 my-3">
                        {format(new Date(m.createdAt), 'EEEE d MMMM')}
                      </p>
                    )}
                    <div className={`group flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words
                        ${m.hidden && !m.body ? 'bg-white border border-dashed border-gray-200 text-gray-400 italic'
                          : mine ? 'bg-ink text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                        {isAdmin && <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">{m.senderRole}{m.hidden ? ' · hidden' : ''}</span>}
                        {m.body ?? 'This message was removed by a moderator.'}
                        <span className={`block text-[10px] mt-0.5 tabular-nums ${mine && !(m.hidden && !m.body) ? 'text-white/60' : 'text-gray-400'}`}>
                          {format(new Date(m.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      {!m.mine && !isAdmin && m.body && (
                        <button type="button" onClick={() => { setReportError(null); setReportTarget(m.id); }}
                          className="mb-1 text-[11px] text-gray-400 hover:text-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100">
                          Report
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {!loadError && messages !== null && (
          writable && !isAdmin ? (
            <form className="border-t border-gray-100 p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              {sendError && <p role="alert" className="text-xs text-red-600 mb-2">{sendError}</p>}
              <div className="flex items-end gap-2">
                <label htmlFor="msg" className="sr-only">Message</label>
                <textarea id="msg" value={draft} rows={1} maxLength={MESSAGE_MAX}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }}
                  placeholder={`Message the ${otherSide}…`}
                  className="flex-1 resize-none max-h-40 rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 [field-sizing:content]" />
                <button type="submit" disabled={!trimmed || sending} aria-label="Send message"
                  className="h-10 px-4 rounded-xl bg-ink text-white text-xs font-bold flex items-center gap-1.5 hover:bg-ink-hover disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={13} aria-hidden /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Enter to send, Shift+Enter for a new line{draft.length > MESSAGE_MAX - 200 ? ` · ${draft.length}/${MESSAGE_MAX}` : ''}
              </p>
            </form>
          ) : (
            <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
              <Lock size={13} aria-hidden />
              {isAdmin
                ? 'Read only. Administrators can read conversations but not post.'
                : 'This conversation is closed. Messaging ends when a booking is cancelled, declined or expires, and 30 days after it is completed.'}
            </p>
          )
        )}
      </section>

      {reportTarget && (
        <ReasonDialog
          title="Report this message"
          description="Tell a moderator what is wrong with this message. They can remove it from the conversation."
          placeholder="e.g. Asking me to pay outside the agreed terms"
          confirmLabel="Send report" busyLabel="Sending…" cancelLabel="Cancel"
          minLength={REPORT_MIN} maxLength={REPORT_MAX}
          busy={reporting} error={reportError}
          onClose={() => setReportTarget(null)}
          onConfirm={(r) => void report(r)}
        />
      )}
    </div>
  );
}
