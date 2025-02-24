import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SettingsHeaderProps {
  title: string;
  description?: string;
  className?: string;
  showBackButton?: boolean;
}

/**
 * Settings page header with back button
 */
export function SettingsHeader({
  title,
  description,
  className,
  showBackButton = true
}: SettingsHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to settings</span>
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}