// middleware.ts — root of Next.js project (same level as app/)
// Runs at the Edge before ANY page renders
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
  const role         = getRole(request);


  // ── /admin/* — admin only ─────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!role)            return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── /vendor/* — vendor only ───────────────────────────────────────────────
  if (pathname.startsWith('/vendor')) {
    if (!role)             return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role !== 'vendor') return NextResponse.redirect(new URL('/store',      request.url));
    return NextResponse.next();
  }

  // ── Auth pages — redirect logged-in users away ────────────────────────────
  if (pathname.startsWith('/auth/login') ||
      pathname.startsWith('/auth/register')) {
    if (role === 'admin')    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'vendor')   return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    if (role === 'customer') return NextResponse.redirect(new URL('/store',            request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all admin, vendor, and auth routes
  matcher: ['/admin/:path*', '/vendor/:path*', '/auth/:path*'],
};