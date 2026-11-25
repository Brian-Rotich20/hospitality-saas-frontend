// Shared by server components (lib/api/server.ts) and middleware.ts. No Node-only APIs.

/**
 * Backend origin from BACKEND_URL. Accepts both `https://api.example.com` and the older
 * documented `https://api.example.com/api`, so the `/api` prefix is never doubled.
 */
export function backendOrigin(raw: string): string {
  return raw.trim().replace(/\/+$/, '').replace(/\/api$/, '');
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,39}$/;

/**
 * The visitor's IP, for the backend's per-IP rate limits on anonymous server-side requests.
 *
 * Only read from CLIENT_IP_HEADER, a header that the hosting edge sets itself and clients
 * cannot override (e.g. `x-real-ip` on Vercel). Unset (the default) means nothing is
 * forwarded. A raw `x-forwarded-for` from a self-hosted Next server is client-controlled
 * and must not be configured here. The value must be a single, valid IP address.
 */
export function clientIpFrom(getHeader: (name: string) => string | null | undefined): string | null {
  const header = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (!header) return null;
  const value = getHeader(header)?.trim();
  if (!value || value.includes(',')) return null;
  return IPV4.test(value) || IPV6.test(value) ? value : null;
}
