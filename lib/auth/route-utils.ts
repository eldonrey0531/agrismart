import {
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  MODERATOR_ROUTES,
  SELLER_ROUTES,
  PROTECTED_ROUTE_DEFAULTS
} from '@/lib/config/auth-constants'
import type { UserRole, AccountLevel } from '@/types/next-auth'

type RouteInfo = {
  isProtected: boolean
  requiredRole?: UserRole
  requiredAccountLevel?: AccountLevel
  redirectUrl: string
}

/**
 * Check if path starts with any of the given routes
 */
function matchesRoute(path: string, routes: readonly string[]): boolean {
  return routes.some(route => path.startsWith(route))
}

/**
 * Get route protection info for a given path
 */
export function getRouteInfo(path: string): RouteInfo {
  const baseInfo: RouteInfo = {
    isProtected: false,
    redirectUrl: PROTECTED_ROUTE_DEFAULTS.UNAUTHORIZED_REDIRECT
  }

  // Check admin routes first (highest privilege)
  if (matchesRoute(path, ADMIN_ROUTES)) {
    return {
      ...baseInfo,
      isProtected: true,
      requiredRole: 'ADMIN',
      redirectUrl: PROTECTED_ROUTE_DEFAULTS.FORBIDDEN_REDIRECT
    }
  }

  // Check moderator routes
  if (matchesRoute(path, MODERATOR_ROUTES)) {
    return {
      ...baseInfo,
      isProtected: true,
      requiredRole: 'MODERATOR',
      redirectUrl: PROTECTED_ROUTE_DEFAULTS.FORBIDDEN_REDIRECT
    }
  }

  // Check seller routes
  if (matchesRoute(path, SELLER_ROUTES)) {
    return {
      ...baseInfo,
      isProtected: true,
      requiredAccountLevel: 'SELLER',
      redirectUrl: PROTECTED_ROUTE_DEFAULTS.UPGRADE_REDIRECT
    }
  }

  // Check general protected routes
  if (matchesRoute(path, PROTECTED_ROUTES)) {
    return {
      ...baseInfo,
      isProtected: true
    }
  }

  // Public route
  return baseInfo
}

/**
 * Build the redirect URL with callback
 */
export function buildRedirectUrl(baseUrl: string, callbackUrl?: string): URL {
  const url = new URL(baseUrl, process.env.NEXTAUTH_URL)
  if (callbackUrl) {
    url.searchParams.set('callbackUrl', callbackUrl)
  }
  return url
}

/**
 * Check if a path should be excluded from auth checks
 */
export function isExcludedPath(path: string): boolean {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/public') ||
    path === '/favicon.ico'
  )
}

/**
 * Get auth header info from request
 */
export function getAuthHeaders(auth: { userId: string, role: UserRole, accountLevel: AccountLevel }) {
  const headers = new Headers()
  headers.set('x-user-id', auth.userId)
  headers.set('x-user-role', auth.role)
  headers.set('x-user-account-level', auth.accountLevel)
  return headers
}

// Export route types
export type ProtectedRoutePattern = typeof PROTECTED_ROUTES[number]
export type AdminRoutePattern = typeof ADMIN_ROUTES[number]
export type ModeratorRoutePattern = typeof MODERATOR_ROUTES[number]
export type SellerRoutePattern = typeof SELLER_ROUTES[number]