import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { UserRole } from '@/lib/auth/roles';

/**
 * API endpoint role requirements
 */
const API_ROLE_REQUIREMENTS: Record<string, UserRole[]> = {
  // Marketplace endpoints
  'marketplace/products/create': ['seller', 'admin'],
  'marketplace/products/update': ['seller', 'admin'],
  'marketplace/products/delete': ['seller', 'admin'],
  'marketplace/orders/create': ['buyer', 'admin'],
  'marketplace/orders/manage': ['seller', 'admin'],
  
  // Community endpoints
  'community/posts/create': ['buyer', 'seller', 'admin'],
  'community/posts/moderate': ['admin'],
  'community/comments/manage': ['buyer', 'seller', 'admin'],
  
  // Admin endpoints
  'admin/users': ['admin'],
  'admin/settings': ['admin'],
  'admin/moderation': ['admin'],
  
  // User settings
  'settings/profile': ['buyer', 'seller', 'admin'],
  'settings/security': ['buyer', 'seller', 'admin'],
};

/**
 * Get required roles for an API endpoint
 */
function getRequiredRoles(path: string): UserRole[] | null {
  // Remove /api/ prefix and query params
  const normalizedPath = path
    .replace(/^\/api\//, '')
    .split('?')[0];

  // Check exact match
  if (API_ROLE_REQUIREMENTS[normalizedPath]) {
    return API_ROLE_REQUIREMENTS[normalizedPath];
  }

  // Check pattern match
  const matchingPattern = Object.keys(API_ROLE_REQUIREMENTS).find(pattern => 
    normalizedPath.startsWith(pattern)
  );

  return matchingPattern ? API_ROLE_REQUIREMENTS[matchingPattern] : null;
}

/**
 * API guard middleware
 */
export async function apiGuard(request: NextRequest) {
  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Get user role, default to guest
  const userRole = (token?.role as UserRole) || 'guest';

  // Check required roles
  const requiredRoles = getRequiredRoles(request.nextUrl.pathname);
  
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'You do not have permission to perform this action',
        code: 'INSUFFICIENT_PERMISSIONS'
      }),
      {
        status: 403,
        headers: { 'content-type': 'application/json' }
      }
    );
  }

  // Add role and user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', userRole);
  if (token?.sub) {
    requestHeaders.set('x-user-id', token.sub);
  }

  // Continue with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}