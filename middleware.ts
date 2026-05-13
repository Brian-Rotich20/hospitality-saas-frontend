import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode }                 from 'jwt-decode';


interface JWTPayload {
  userId: string;
  role:   'customer' | 'vendor' | 'admin';
  exp:    number;
}

// Read role from JWT directly — most reliable source
// Falls back to user_role cookie when access_token has expired
function getRole(req: NextRequest): string | null {
  const accessToken = req.cookies.get('access_token')?.value;
  if (accessToken) {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      if (decoded.exp > Date.now() / 1000) return decoded.role;
    } catch { /* invalid */ }
  }
  return req.cookies.get('user_role')?.value ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  let role: string | null = null;
  let hasValidToken = false;

  if (accessToken) {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      hasValidToken = decoded.exp > Date.now() / 1000;
      if (hasValidToken) role = decoded.role;
    } catch { /* invalid */ }
  }
  if (!role) role = request.cookies.get('user_role')?.value ?? null;

  // ── /admin/* ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!role || !hasValidToken)
      return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'admin')
      return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /vendor/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    // verify-email: vendor just registered, role=vendor but not yet approved
    // Must be open — no further checks
    if (pathname === '/vendor/verify-email') return NextResponse.next();

    if (!role || !hasValidToken)
      return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'vendor')
      return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /customer/* ───────────────────────────────────────────────────────
  if (pathname.startsWith('/customer')) {
    if (!role || !hasValidToken)
      return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'customer')
      return NextResponse.redirect(new URL('/store', request.url));
    return NextResponse.next();
  }

  // ── /auth/login + /auth/register — redirect if already logged in ──────
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (!hasValidToken) return NextResponse.next();
    if (role === 'admin')    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    if (role === 'customer') return NextResponse.redirect(new URL('/store', request.url));
  }

  return NextResponse.next();
}