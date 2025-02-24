'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { UserRole } from '@/types/auth';
import { Icons } from '@/components/ui/icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredFeatures?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Default unauthorized component
 */
function DefaultUnauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <Icons.shield className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">
        You don&apos;t have permission to access this page.
      </p>
    </div>
  );
}

/**
 * Protected route component
 */
export function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredFeatures = [],
  redirectTo = '/login',
  requireAuth = true,
  loadingComponent = <DefaultLoading />,
  unauthorizedComponent = <DefaultUnauthorized />,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isAuthenticated, isLoading, hasAccess } = useAuth();

  useEffect(() => {
    // Wait for auth to be ready
    if (isLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Admin bypass
    if (role === 'admin') return;

    // Check role requirements
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push('/unauthorized');
      return;
    }

    // Check feature requirements
    if (requiredFeatures.length > 0) {
      const hasAllFeatures = requiredFeatures.every(feature => 
        hasAccess('', feature)
      );
      if (!hasAllFeatures) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    role,
    allowedRoles,
    requiredFeatures,
    hasAccess,
    router,
    pathname,
    redirectTo,
    requireAuth,
  ]);

  if (isLoading) {
    return loadingComponent;
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Let the redirect happen
  }

  if (
    role !== 'admin' &&
    ((allowedRoles.length > 0 && !allowedRoles.includes(role)) ||
      (requiredFeatures.length > 0 &&
        !requiredFeatures.every(feature => hasAccess('', feature))))
  ) {
    return unauthorizedComponent;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for route protection
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;