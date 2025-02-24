import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasPageAccess, type UserRole } from '@/lib/auth/roles';

/**
 * Configuration for public paths that don't require authentication
 */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/api/auth',
  '/resources'  // Public but with limited access
];

/**
 * Configuration for role-required paths
 */
const ROLE_PATHS: Record<string, UserRole[]> = {
  '/marketplace/sell': ['seller', 'admin'],
  '/marketplace/buy': ['buyer', 'admin'],
  '/admin': ['admin'],
  '/dashboard': ['buyer', 'seller', 'admin'],
  '/settings': ['buyer', 'seller', 'admin']
};

/**
 * Check if a path is public
 */
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

/**
 * Get required roles for a path
 */
function getRequiredRoles(path: string): UserRole[] | null {
  const matchingPath = Object.keys(ROLE_PATHS).find(routePath => 
    path.startsWith(routePath)
  );
  return matchingPath ? ROLE_PATHS[matchingPath] : null;
}

/**
 * Route guard middleware
 */
export async function routeGuard(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Get user role, default to guest
  const userRole = (token?.role as UserRole) || 'guest';

  // Check required roles
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    // Redirect to login for unauthenticated users
    if (userRole === 'guest') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Return 403 for authenticated users without proper role
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to access this page'
      }),
      {
        status: 403,
        headers: { 'content-type': 'application/json' }
      }
    );
  }

  // Check page access based on role
  if (!hasPageAccess(userRole, pathname)) {
    if (userRole === 'guest') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'You do not have permission to access this page'
      }),
      {
        status: 403,
        headers: { 'content-type': 'application/json' }
      }
    );
  }

  // Add role to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', userRole);

  // Continue with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}