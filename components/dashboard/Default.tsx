'use client';

import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/lib/config';
import { Icons } from '@/components/ui/icons';

export default function DashboardDefault() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(authConfig.defaultAuthenticatedRoute);
    }
  }, [isLoading, isAuthenticated, router]);

  // Error state with premium styling
  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-8">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 via-transparent to-[#172F21]/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />
        </div>

        <Alert 
          variant="destructive" 
          className="max-w-lg bg-gradient-to-r from-red-950/50 to-red-900/50 backdrop-blur-sm border-red-800/50"
        >
          <div className="flex items-center gap-3">
            <Icons.alertTriangle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-red-200">
              {error.message || 'An error occurred while loading the dashboard'}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  // Loading state with premium styling
  return (
    <div className="relative flex min-h-screen items-center justify-center p-8">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 via-transparent to-[#172F21]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />
      </div>

      <Card className="premium-card relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 to-transparent" />
        <div className="relative">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#38FF7E]/20 to-transparent animate-pulse" />
              <Icons.spinner className="h-12 w-12 animate-spin text-[#38FF7E]" />
            </div>
            <p className="text-lg text-[#E3FFED]">
              {isLoading ? 'Checking authentication...' : 'Loading dashboard...'}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 text-center">
              <div className="inline-block rounded-lg bg-gradient-to-r from-[#244A32]/30 to-[#172F21]/30 px-4 py-2 backdrop-blur-sm">
                <p className="text-sm text-[#E3FFED]/70">
                  Auth Status: {' '}
                  <span className={isAuthenticated ? 'text-[#38FF7E]' : 'text-yellow-400'}>
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </p>
                <p className="text-sm text-[#E3FFED]/70">
                  Loading: {' '}
                  <span className={isLoading ? 'text-[#38FF7E]' : 'text-[#E3FFED]'}>
                    {isLoading ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}