import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { UserRole } from '@/types/auth';

interface RoleGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredFeatures?: string[];
}

/**
 * Hook for route-based access control
 */
export function useRoleGuard(options: RoleGuardOptions = {}) {
  const {
    redirectTo = '/login',
    requireAuth = true,
    allowedRoles = [],
    requiredFeatures = [],
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { role, isAuthenticated, isLoading, hasAccess } = useAuth();

  /**
   * Check if current user has access
   */
  const checkAccess = useCallback(() => {
    // Wait for auth to be ready
    if (isLoading) return false;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      return false;
    }

    // Admin always has access
    if (role === 'admin') return true;

    // Check role requirements
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push('/unauthorized');
      return false;
    }

    // Check feature requirements
    if (requiredFeatures.length > 0) {
      const hasAllFeatures = requiredFeatures.every(feature => 
        hasAccess('', feature)
      );
      if (!hasAllFeatures) {
        router.push('/unauthorized');
        return false;
      }
    }

    return true;
  }, [
    isLoading,
    isAuthenticated,
    role,
    requireAuth,
    allowedRoles,
    requiredFeatures,
    hasAccess,
    router,
    pathname,
    redirectTo,
  ]);

  /**
   * Guard function for protecting route handlers
   */
  const guard = useCallback(
    async <T extends (...args: any[]) => any>(
      handler: T
    ): Promise<ReturnType<T> | void> => {
      if (checkAccess()) {
        return handler();
      }
    },
    [checkAccess]
  );

  return {
    guard,
    checkAccess,
    isAllowed: !isLoading && checkAccess(),
    isLoading,
  };
}

/**
 * Route protection options
 */
export type RouteProtectionOptions = RoleGuardOptions;

/**
 * Higher-order function for protecting API routes
 */
export function withRoleGuard<T extends (...args: any[]) => any>(
  handler: T,
  options: RouteProtectionOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const { checkAccess } = useRoleGuard(options);
    if (checkAccess()) {
      return handler(...args);
    }
  }) as T;
}

export default useRoleGuard;