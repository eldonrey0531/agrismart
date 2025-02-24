'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageLoading, Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

function PageHeader({
  heading,
  text,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}

interface ProtectedPageProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
  header?: {
    heading: string;
    text?: string;
    children?: React.ReactNode;
  };
  allowedRoles?: UserRole[];
  requiredFeatures?: string[];
  className?: string;
}

export function ProtectedPage({
  children,
  loading,
  header,
  allowedRoles,
  requiredFeatures,
  className,
}: ProtectedPageProps) {
  const pathname = usePathname();

  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      requiredFeatures={requiredFeatures}
      loadingComponent={<PageLoading />}
    >
      <div className={cn('container space-y-6 pb-16 pt-6', className)}>
        {header && (
          <PageHeader
            heading={header.heading}
            text={header.text}
            children={header.children}
          />
        )}
        <Suspense fallback={loading || <Loading />}>
          {children}
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'There was a problem loading this page.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center',
        className
      )}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {action}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No data available',
  message = 'There is no data to display at this time.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center',
        className
      )}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {action}
    </div>
  );
}

export default ProtectedPage;