'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorDisplay } from '@/components/ui/error-display';
import { AuthDebug } from '@/components/auth/auth-debug';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <ErrorDisplay 
        error={error}
        onRetry={reset}
        onHome={() => router.push('/')}
      />
      {/* Debug info in development */}
      <AuthDebug />
    </div>
  );
}