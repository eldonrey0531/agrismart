'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/reset-password',
  '/verify-email',
];

export function AuthGuard({ 
  children,
  fallback = <div className="flex h-screen items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Don't check auth on public routes
    if (isPublicRoute) return;

    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      const searchParams = new URLSearchParams();
      // Only set redirectTo if not on a public route
      if (!PUBLIC_ROUTES.includes(pathname)) {
        searchParams.set('redirectTo', pathname);
      }
      router.push(`/login?${searchParams.toString()}`);
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute]);

  // Show loading state
  if (isLoading) {
    return fallback;
  }

  // On public routes, always render
  if (isPublicRoute) {
    return children;
  }

  // On protected routes, only render if authenticated
  return isAuthenticated ? children : null;
}