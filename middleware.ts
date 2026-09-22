// middleware.ts  (Next.js root — same level as app/)
import { NextRequest, NextResponse } from 'next/server';

type UserRole = 'customer' | 'vendor' | 'admin';

interface SessionUser { role?: UserRole; emailVerified?: boolean; vendorOnboarded?: boolean; }

interface SessionResponse { user?: SessionUser; }

const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const AUTH_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  vendor: '/vendor/dashboard',
  customer: '/store',
};


async function getSession(request: NextRequest): Promise<SessionUser | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  try {
    const response = await fetch(AUTH_ORIGIN + '/api/auth/get-session', {
      headers: { cookie }, cache: 'no-store',
    });
    if (!response.ok) return null;
    return ((await response.json()) as SessionResponse | null)?.user ?? null;
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = new URL('/auth/login', request.url);
  url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const user = await getSession(request);
  const role = user?.role;
  const isVerified = user?.emailVerified === true;

  // ── 1. /admin/* ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) return redirectToLogin(request);    
    if (role !== 'admin') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
    return NextResponse.next();
  }

  // ── 2. /vendor/* ───────────────────────────────────────────────────────────
  // if (pathname.startsWith('/vendor')) {
  //     if (!user) return redirectToLogin(request);
  //     if (role !== 'vendor') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));

  //     const onboarded = user?.vendorOnboarded === true;
  //     if (pathname === '/vendor/onboarding') {
  //       if (onboarded) return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  //       return NextResponse.next();
  //     }
  //     if (!onboarded) return NextResponse.redirect(new URL('/vendor/onboarding', request.url));

  //     return NextResponse.next();
  //   }
  // ── 3. /customer/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/customer')) {
    if (!user) return redirectToLogin(request);
    if (role !== 'customer') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
    return NextResponse.next();
  }

  // ── 4. Auth pages — length if already logged in + verified ──────────
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/auth/register-vendor'
  ) {
    if (user && isVerified) {
      return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
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
