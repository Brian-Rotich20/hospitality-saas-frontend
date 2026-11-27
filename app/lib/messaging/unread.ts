'use client';

// Unread state for conversations. The backend has no read receipts: the integration guide
// says to derive unread state from `lastMessageAt`. We remember, per browser, the newest
// message time the user has seen in each conversation and compare it with lastMessageAt.
// Limitation: read state is per device, and a message the user sent from another device
// counts as unread here until the thread is opened.

import { useCallback, useEffect, useState } from 'react';
import { messagingService } from '../api/endpoints';
import type { ConversationSummary } from '../types/messaging';

const KEY = 'lm.messages.seen.v1';
const EVENT = 'lm:messages-seen';

function readSeen(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Records that the user has seen everything up to `at` in a conversation. */
export function markSeen(conversationId: string, at: string | null | undefined) {
  if (!at) return;
  try {
    const seen = readSeen();
    if (seen[conversationId] && seen[conversationId]! >= at) return;
    seen[conversationId] = at;
    window.localStorage.setItem(KEY, JSON.stringify(seen));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* storage unavailable: unread dots simply persist */ }
}

export function isUnread(c: Pick<ConversationSummary, 'id' | 'lastMessageAt'>, seen: Record<string, string>): boolean {
  if (!c.lastMessageAt) return false;
  const s = seen[c.id];
  return !s || new Date(c.lastMessageAt).getTime() > new Date(s).getTime();
}

/** Re-renders when read state changes in this tab or another one. */
export function useSeen(): Record<string, string> {
  const [seen, setSeen] = useState<Record<string, string>>({});
  useEffect(() => {
    const sync = () => setSeen(readSeen());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);
  return seen;
}

/**
 * Polls GET /conversations while the tab is visible. `enabled` is false for admins and
 * signed-out visitors (the endpoint lists only the caller's own conversations).
 */
export function useConversations(enabled: boolean, intervalMs = 30_000) {
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await messagingService.list();
      setItems(Array.isArray(res.data) ? res.data : []);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const tick = () => { if (document.visibilityState === 'visible') void refresh(); };
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [enabled, intervalMs, refresh]);

  return { items, error, refresh };
}

/** Number of conversations with unseen messages (for nav indicators). */
export function useUnreadCount(enabled: boolean): number {
  const { items } = useConversations(enabled, 60_000);
  const seen = useSeen();
  return (items ?? []).filter((c) => isUnread(c, seen)).length;
}
