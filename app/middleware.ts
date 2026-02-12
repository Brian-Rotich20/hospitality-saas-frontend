import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
);

type UserRole = 'customer' | 'vendor' | 'admin';

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/register-vendor',
  '/auth/forgot-password',
  '/listings',
  '/about',
];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/dashboard': ['customer'],
  '/customer': ['customer'],
  '/bookings': ['customer'],
  '/profile': ['customer'],
  '/vendor': ['vendor'],
  '/vendor/dashboard': ['vendor'],
  '/vendor/listings': ['vendor'],
  '/vendor/analytics': ['vendor'],
  '/admin': ['admin'],
  '/admin/dashboard': ['admin'],
  '/admin/vendors': ['admin'],
  '/admin/analytics': ['admin'],
};

function parseToken(token: string): JWTPayload | null {
  try {
    const decoded = jwtDecode(token) as JWTPayload;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookies
  const token = request.cookies.get('accessToken')?.value;
  return token || null;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === route;
    return pathname.startsWith(route);
  });
}

function getRequiredRole(pathname: string): UserRole | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles[0]; // Return first role (could be any of them)
    }
  }
  return null;
}

function isRouteAllowed(pathname: string, userRole: UserRole): boolean {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles.includes(userRole);
    }
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/')) {
      const token = getTokenFromRequest(request);
      if (token && parseToken(token)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Get token
  const token = getTokenFromRequest(request);
  
  if (!token) {
    // Redirect to login if trying to access protected route
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Parse and validate token
  const payload = parseToken(token);
  
  if (!payload) {
    // Token is invalid or expired - redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  // Check role-based access
  if (!isRouteAllowed(pathname, payload.role)) {
    // User doesn't have permission for this route
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Set user info in headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};