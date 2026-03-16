// middleware.ts — Edge middleware, runs before any page render
import { NextRequest, NextResponse } from 'next/server';

const VENDOR_PREFIX  = '/vendor';
const ADMIN_PREFIXES = ['/admin', '/admin-dashboard', '/admin-analytics'];
const AUTH_PATHS     = ['/auth/login', '/auth/register', '/auth/register-vendor'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('user_role')?.value;

  // ── Vendor routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith(VENDOR_PREFIX)) {
    if (!role)             return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (ADMIN_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!role)             return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'admin')  return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── Auth pages — skip if already logged in ────────────────────────────────
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard',   request.url));
    if (role === 'admin')    return NextResponse.redirect(new URL('/admin-dashboard',     request.url));
    if (role === 'customer') return NextResponse.redirect(new URL('/store',               request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    '/admin-dashboard/:path*',
    '/admin-analytics/:path*',
    '/auth/:path*',
  ],
};