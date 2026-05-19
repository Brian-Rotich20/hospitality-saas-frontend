// middleware.ts  (Next.js root — same level as app/)
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode }                 from 'jwt-decode';

interface JWTPayload {
  userId:        string;
  role:          'customer' | 'vendor' | 'admin';
  emailVerified: boolean;
  exp:           number;
}

function decodeToken(token: string): JWTPayload | null {
  try {
    const d = jwtDecode<JWTPayload>(token);
    // Token must not be expired
    return d.exp > Date.now() / 1000 ? d : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawToken = request.cookies.get('access_token')?.value;
  const decoded  = rawToken ? decodeToken(rawToken) : null;

  const hasValidToken = decoded !== null;
  const role          = decoded?.role ?? null;
  const verified      = decoded?.emailVerified ?? false;

  // ── 1. Verify-email pages — ALWAYS open ────────────────────────────────────
  // User has a token but emailVerified=false — they must be able to reach these.
  if (pathname === '/auth/verify-email' || pathname === '/vendor/verify-email') {
    return NextResponse.next();
  }

  // ── 2. /admin/* ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!hasValidToken) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!verified)      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── 3. /vendor/* ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    if (!hasValidToken) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!verified)      return NextResponse.redirect(new URL('/vendor/(vendor)/verify-email', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── 4. /customer/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/customer')) {
    if (!hasValidToken)    return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!verified)         return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    if (role !== 'customer') return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── 5. Auth pages — redirect away if already logged in + verified ──────────
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/auth/register-vendor'
  ) {
    if (hasValidToken && verified) {
      if (role === 'admin')    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      if (role === 'customer') return NextResponse.redirect(new URL('/store', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/customer/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/register-vendor',
    '/auth/verify-email',
    '/vendor/verify-email',
  ],
};