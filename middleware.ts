// middleware.ts  (Next.js root — same level as app/)
import { NextRequest, NextResponse } from 'next/server';

type UserRole = 'customer' | 'vendor' | 'admin';

interface SessionUser {
  role?: UserRole;
  emailVerified?: boolean;
}

interface SessionResponse {
  user?: SessionUser;
}

const API_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api';
const AUTH_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  vendor: '/vendor/dashboard',
  customer: '/store',
};

const VERIFY_EMAIL_BY_ROLE: Record<UserRole, string> = {
  admin: '/auth/verify-email',
  vendor: '/vendor/verify-email',
  customer: '/auth/verify-email',
};

async function getSession(request: NextRequest): Promise<SessionUser | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  try {
    const response = await fetch(AUTH_ORIGIN + '/api/auth/get-session', {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const session = (await response.json()) as SessionResponse | null;
    return session?.user ?? null;
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

  // ── 1. Verify-email pages — ALWAYS open ────────────────────────────────────
  // User has a token but emailVerified=false — they must be able to reach these.
  if (pathname === '/auth/verify-email' || pathname === '/vendor/verify-email') {
    return NextResponse.next();
  }

  // ── 2. /admin/* ────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) return redirectToLogin(request);
    if (!isVerified) return NextResponse.redirect(new URL(VERIFY_EMAIL_BY_ROLE[role ?? 'customer'], request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
    return NextResponse.next();
  }

  // ── 3. /vendor/* ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    if (!user) return redirectToLogin(request);
    if (!isVerified) return NextResponse.redirect(new URL(VERIFY_EMAIL_BY_ROLE[role ?? 'customer'], request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
    return NextResponse.next();
  }

  // ── 4. /customer/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/customer')) {
    if (!user) return redirectToLogin(request);
    if (!isVerified) return NextResponse.redirect(new URL(VERIFY_EMAIL_BY_ROLE[role ?? 'customer'], request.url));
    if (role !== 'customer') return NextResponse.redirect(new URL(DASHBOARD_BY_ROLE[role ?? 'customer'], request.url));
    return NextResponse.next();
  }

  // ── 5. Auth pages — redirect away if already logged in + verified ──────────
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
