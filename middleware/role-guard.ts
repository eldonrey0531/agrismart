import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasPageAccess, UserRole } from '@/lib/auth/roles';
import { getToken } from 'next-auth/jwt';

/**
 * Configuration for public paths that don't require authentication
 */
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/api/auth'
];

/**
 * Check if a path is public
 */
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

/**
 * Role-based middleware guard
 */
export async function roleGuard(request: NextRequest) {
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

  // Default to guest role if no token
  const userRole = (token?.role as UserRole) || 'guest';

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Special handling for API routes
    const apiPath = pathname.replace('/api/', '');
    
    // Check if user has access to the corresponding feature
    if (!hasPageAccess(userRole, apiPath)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'You do not have permission to access this resource'
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
    return NextResponse.next();
  }

  // Page route protection
  const hasAccess = hasPageAccess(userRole, pathname);
  
  if (!hasAccess) {
    // Redirect to login for unauthenticated users
    if (userRole === 'guest') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // Return 403 for authenticated users without proper access
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

  return NextResponse.next();
}

/**
 * Marketplace specific role guard
 */
export async function marketplaceGuard(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const userRole = (token?.role as UserRole) || 'guest';
  const { pathname } = request.nextUrl;

  // Block unauthorized marketplace actions
  if (pathname.startsWith('/api/marketplace/')) {
    const action = pathname.split('/')[3]; // e.g., 'products', 'orders'
    
    const isBuyerAction = action === 'orders' || action === 'purchase';
    const isSellerAction = action === 'products' || action === 'listings';

    if (
      (isBuyerAction && userRole !== 'buyer' && userRole !== 'admin') ||
      (isSellerAction && userRole !== 'seller' && userRole !== 'admin')
    ) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'You do not have permission to perform this action'
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Community specific role guard
 */
export async function communityGuard(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const userRole = (token?.role as UserRole) || 'guest';
  const { pathname } = request.nextUrl;

  // Handle community actions
  if (pathname.startsWith('/api/community/')) {
    const action = pathname.split('/')[3]; // e.g., 'posts', 'comments'
    
    // Guest can only view
    if (userRole === 'guest' && (action === 'create' || action === 'update' || action === 'delete')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'You must be logged in to perform this action'
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}