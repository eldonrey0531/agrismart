'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './use-auth';
import { logAuthFlow } from '@/lib/utils/auth-utils';

export function useAuthDebug() {
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectTo = searchParams.get('redirectTo');
    logAuthFlow('Auth State Change', {
      pathname,
      redirectTo,
      isAuthenticated,
      isLoading,
      error: error?.message,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    });
  }, [pathname, searchParams, isAuthenticated, isLoading, error, user]);

  useEffect(() => {
    // Log initial route
    logAuthFlow('Route Change', {
      pathname,
      searchParams: Object.fromEntries(searchParams.entries()),
    });
  }, [pathname, searchParams]);

  return {
    debugInfo: {
      pathname,
      redirectTo: searchParams.get('redirectTo'),
      isAuthenticated,
      isLoading,
      error: error?.message,
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
    },
  };
}