// lib/api/server.ts - server-side API calls (server components). Forwards the visitor's
// session cookie and, when configured, the visitor's IP; handles errors and JSON parsing.

import { cookies, headers } from 'next/headers';
import { backendOrigin, clientIpFrom } from './backend';

export function getServerApiUrl(): string {
  return backendOrigin(process.env.BACKEND_URL || 'https://hospitality-saas-platform.onrender.com') + '/api';
}

export async function serverFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const base = getServerApiUrl();
  const [cookieStore, incoming] = await Promise.all([cookies(), headers()]);
  const cookieHeader = cookieStore.toString();
  // Without this, every anonymous server-rendered request is rate-limited as the Next server.
  const clientIp = clientIpFrom((name) => incoming.get(name));

  const url = `${base}${path}`;
  const hasCustomCaching = 'cache' in options || 'next' in options;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
        ...options.headers,
      },
      ...(hasCustomCaching ? {} : { cache: 'no-store' }),
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const json = JSON.parse(text) as { error?: string; message?: string };
        msg = json.error ?? json.message ?? msg;
      } catch { /* not JSON */ }
      console.error(`[serverFetch] ${options.method ?? 'GET'} ${path} → ${res.status}: ${msg}`);
      return { data: null, error: msg };
    }

    const json = JSON.parse(text) as { data?: T };
    return { data: (json.data ?? json) as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[serverFetch] ${options.method ?? 'GET'} ${path} threw: ${message}`);
    return { data: null, error: 'The service is temporarily unavailable' };
  }
}
