// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const VENDOR_PREFIX   = '/vendor';
const ADMIN_PREFIXES  = ['/admin/dashboard', '/admin/analytics', '/admin'];
const AUTH_PATHS      = ['/auth/login', '/auth/register', '/auth/register-vendor'];

interface TokenPayload {
  userId: string;
  role:   'customer' | 'vendor' | 'admin';
  exp:    number;
}

// ✅ Read role from access_token JWT directly — NOT from user_role cookie
// This prevents stale cookie mismatch where user_role=admin but JWT=customer
function getRoleFromToken(request: NextRequest): string | null {
  // First try access_token cookie (set by auth context, expires 15min)
  const accessToken = request.cookies.get('access_token')?.value;
  if (accessToken) {
    try {
      const decoded = jwtDecode<TokenPayload>(accessToken);
      // Check token not expired
      if (decoded.exp && decoded.exp > Date.now() / 1000) {
        return decoded.role;
      }
    } catch { /* invalid token */ }
  }

  // Fallback to user_role cookie (set by auth context, expires 7 days)
  // Used when access_token has expired but refresh hasn't happened yet
  return request.cookies.get('user_role')?.value ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = getRoleFromToken(request);

  // ── Vendor routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith(VENDOR_PREFIX)) {
    if (!role)             return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── Admin routes — check LONGER prefixes first ────────────────────────────
  if (ADMIN_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!role)            return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── Auth pages — redirect if already logged in ────────────────────────────
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    if (role === 'admin')    return NextResponse.redirect(new URL('/admin/dashboard',  request.url));
    if (role === 'customer') return NextResponse.redirect(new URL('/store',            request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    '/admin/dashboard/:path*',
    '/admin/analytics/:path*',
    '/auth/:path*',
  ],
};