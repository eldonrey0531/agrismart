'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authConfig } from '@/lib/config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';

export default function AgriSmartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to home page if authenticated
    if (!isLoading && isAuthenticated) {
      router.replace('/agrismart/home');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" text="Loading AgriSmart..." />
    </div>
  );
}