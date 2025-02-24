'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useToast } from '@/components/ui/use-toast';
import { ERROR_MESSAGES } from '@/lib/constants';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requireUnauth?: boolean;
  fullScreenLoading?: boolean;
}

export function ProtectedLayout({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requireUnauth = false,
  fullScreenLoading = true,
}: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      // Handle authenticated users
      if (isAuthenticated && requireUnauth) {
        router.replace('/dashboard');
        return;
      }

      // Handle unauthenticated users
      if (!isAuthenticated && requireAuth) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED,
        });
        router.replace(`${redirectTo}?from=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireUnauth, redirectTo, router, toast]);

  // Show loading state
  if (isLoading) {
    return fullScreenLoading ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner
          size="lg"
          text="Checking authentication..."
        />
      </div>
    ) : (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorDisplay
          title="Authentication Error"
          error={error}
          size="lg"
        />
      </div>
    );
  }

  // Show content if authentication requirements are met
  if (
    (requireAuth && isAuthenticated) ||
    (requireUnauth && !isAuthenticated) ||
    (!requireAuth && !requireUnauth)
  ) {
    return <>{children}</>;
  }

  // Fallback loading state
  return null;
}

/**
 * Usage Examples:
 * 
 * // Protected route (requires authentication)
 * <ProtectedLayout>
 *   <DashboardContent />
 * </ProtectedLayout>
 * 
 * // Auth route (requires no authentication)
 * <ProtectedLayout
 *   requireAuth={false}
 *   requireUnauth={true}
 *   redirectTo="/dashboard"
 * >
 *   <LoginForm />
 * </ProtectedLayout>
 * 
 * // Public route with auth state
 * <ProtectedLayout
 *   requireAuth={false}
 *   fullScreenLoading={false}
 * >
 *   <PublicContent />
 * </ProtectedLayout>
 */