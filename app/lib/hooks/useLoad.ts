'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '../api/client';

/**
 * Loads data with a uniform loading / error / reload contract. Responses that arrive after
 * a newer request started are ignored, so fast filter changes never show stale rows.
 */
export function useLoad<T>(fn: () => Promise<{ data: T }>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const reload = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await load();
      if (mine === seq.current) setData(res.data);
    } catch (err) {
      if (mine === seq.current) setError(err as ApiError);
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, [load]);

  useEffect(() => { void reload(); }, [reload]);

  return { data, error, loading, reload, setData };
}
