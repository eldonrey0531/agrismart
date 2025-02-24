'use client';

import { Icons } from '@/components/ui/icons';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: Error;
  reset?: () => void;
  onRetry?: () => void;
  onHome?: () => void;
}

export function ErrorDisplay({
  error,
  reset,
  onRetry,
  onHome,
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <div className="mx-auto flex max-w-[500px] flex-col items-center space-y-4">
        <Icons.warning className="h-12 w-12 text-destructive" />
        <h1 className="text-center text-2xl font-bold">Something went wrong!</h1>
        
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4">
          {onHome && (
            <ButtonWrapper variant="outline" onClickHandler={onHome}>
              Go Home
            </ButtonWrapper>
          )}
          {(reset || onRetry) && (
            <ButtonWrapper
              onClickHandler={() => {
                if (reset) reset();
                if (onRetry) onRetry();
              }}
            >
              Try Again
            </ButtonWrapper>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="w-full rounded-lg border p-4">
            <pre className="overflow-auto text-xs">{error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
