// lib/api/server.ts - This is for server-side API calls in Next.js. It handles authentication, errors, and JSON parsing consistently.

import { cookies } from 'next/headers';

export function getServerApiUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error(
      'BACKEND_URL environment variable is not set.\n' +
      'Add it to Vercel: Settings → Environment Variables\n' +
      'Value: https://hospitality-saas-platform.onrender.com'
    );
  }
  return url.replace(/\/+$/, ''); // strip trailing slash
}

/*-*
 * Server-side authenticated fetch wrapper.
 * Forwards the incoming request's cookies (better Auth session) to backend API.
  * instead of a Bearer token — there is no client-visible token under Better Auth.
 */
export async function serverFetch<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    let base: string;
    try {
      base = getServerApiUrl();
    } catch (err: any) {
      console.error('[serverFetch]', err.message);
      return { data: null, error: err.message };
    }

    const cookieStore = await cookies();
    const  cookieHeader = cookieStore.toString();


    if (!cookieHeader) {
    return { data: null, error: 'Not authenticated — please log out and back in' };
  }

  const url = `${base}${path}`;
  console.log(`[serverFetch] ${options.method ?? 'GET'} ${url}`);

  try {
    const res  = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        ...options.headers,
      },
      cache: 'no-store',
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const json = JSON.parse(text);
         console.error(`[serverFetch] error body:`, JSON.stringify(json, null, 2));
        msg = json.error ?? json.message ?? msg;
      } catch { /* not JSON */ }
      console.error(`[serverFetch] ${url} → ${res.status}:`, msg);
      return { data: null, error: msg };
    }

    const json = JSON.parse(text);
    return { data: json.data ?? json, error: null };
  } catch (err: any) {
    console.error(`[serverFetch] ${url} threw:`, err?.message);
    return { data: null, error: `Network error: ${err?.message}` };
  }
}