'use client';

import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Loading text to display */
  text?: string;
  /** Size of the spinner (sm | md | lg) */
  size?: 'sm' | 'md' | 'lg';
  /** Center the loading indicator */
  center?: boolean;
  /** Show full page overlay */
  fullPage?: boolean;
}

/**
 * Loading spinner component
 */
export function Loading({
  text = 'Loading...',
  size = 'md',
  center = true,
  fullPage = false,
  className,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-2',
        center && 'justify-center',
        className
      )}
      {...props}
    >
      <Icons.spinner
        className={cn('animate-spin text-primary', sizeClasses[size])}
      />
      {text && (
        <span className="text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Loading skeleton component
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

/**
 * Page loading component
 */
export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loading size="lg" text="Loading page..." />
    </div>
  );
}

/**
 * Table loading component
 */
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form loading component
 */
export function FormLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-[100px]" />
    </div>
  );
}

export default Loading;