'use client';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ 
  size = 'md',
  text,
  className,
  textClassName,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Icons.spinner className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      {text && (
        <p className={cn('text-sm text-muted-foreground', textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}