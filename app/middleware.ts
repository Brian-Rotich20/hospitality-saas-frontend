// middleware.ts — runs at the Edge before any page renders
// Protects vendor/admin routes and redirects logged-in users away from auth pages

import { NextRequest, NextResponse } from 'next/server';

const VENDOR_PREFIX = '/vendor';
const ADMIN_PREFIX  = '/admin';
const AUTH_PATHS    = ['/auth/login', '/auth/register', '/auth/register-vendor'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // user_role cookie: NOT httpOnly — set by auth context after login so middleware can read it
  const role = request.cookies.get('user_role')?.value;

  // ── Vendor routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith(VENDOR_PREFIX)) {
    if (!role)               return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'vendor')   return NextResponse.redirect(new URL('/store',      request.url));
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!role)               return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'admin')    return NextResponse.redirect(new URL('/store',      request.url));
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
  matcher: ['/vendor/:path*', '/admin/:path*', '/auth/:path*'],
};