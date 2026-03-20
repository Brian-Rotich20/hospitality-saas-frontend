// lib/api/server.ts

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

/**
 * Server-side authenticated fetch wrapper.
 * Handles auth, errors, and JSON parsing consistently.
 */
export async function serverFetch<T = any>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  let base: string;
  try {
    base = getServerApiUrl();
  } catch (err: any) {
    console.error('[serverFetch]', err.message);
    return { data: null, error: err.message };
  }

  if (!token) {
    return { data: null, error: 'Not authenticated — please log out and back in' };
  }

  const url = `${base}${path}`;
  console.log(`[serverFetch] ${options.method ?? 'GET'} ${url}`);

  try {
    const res  = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`,
        ...options.headers,
      },
      cache: 'no-store',
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const json = JSON.parse(text);
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