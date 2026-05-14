// middleware.ts  (Next.js root)
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
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.exp > Date.now() / 1000 ? decoded : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Decode JWT (most reliable source) ─────────────────────────────────────
  const accessToken = request.cookies.get('access_token')?.value;
  const decoded     = accessToken ? decodeToken(accessToken) : null;

  const hasValidToken   = decoded !== null;
  const role            = decoded?.role ?? request.cookies.get('user_role')?.value ?? null;
  const emailVerified   = decoded?.emailVerified ?? false;

  // ── Verification pages — always open (user holds a token but is unverified) ─
  if (
    pathname === '/auth/verify-email' ||
    pathname === '/vendor/verify-email'
  ) {
    return NextResponse.next();
  }

  // ── /admin/* ────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!hasValidToken)    return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!emailVerified)    return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    if (role !== 'admin')  return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /vendor/* ───────────────────────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    if (!hasValidToken)    return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!emailVerified)    return NextResponse.redirect(new URL('/vendor/verify-email', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /customer/* ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/customer')) {
    if (!hasValidToken)      return NextResponse.redirect(new URL('/auth/login', request.url));
    if (!emailVerified)      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    if (role !== 'customer') return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /auth/login + /auth/register — skip if already logged in ───────────────
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (!hasValidToken || !emailVerified) return NextResponse.next();
    if (role === 'admin')    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    if (role === 'customer') return NextResponse.redirect(new URL('/store', request.url));
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
  ],
};