'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { toast } = useToast();

  useEffect(() => {
    // Log the error to your error tracking service
    console.error('Settings Error:', error);

    // Show error toast
    toast({
      variant: 'destructive',
      title: 'Error Loading Settings',
      description: 'There was a problem loading your settings. Please try again.',
    });
  }, [error, toast]);

  return (
    <div className="container max-w-screen-lg py-10">
      {/* Keep the header for consistency */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card className="p-6">
        <ErrorDisplay
          title="Settings Error"
          error={error.message || "There was a problem loading your settings"}
          retry={reset}
          size="lg"
        />

        <div className="mt-6 flex items-center justify-between border-t pt-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icons.info className="h-4 w-4" />
            <p>Error Code: {error.digest}</p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <Icons.refresh className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button
              variant="default"
              onClick={() => reset()}
            >
              <Icons.check className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <div className="mt-6">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icons.info className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If this error persists, try these steps:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Clear your browser cache and refresh</li>
                <li>Check your internet connection</li>
                <li>Try logging out and back in</li>
                <li>Contact support if the issue continues</li>
              </ul>
              <Button
                variant="link"
                className="px-0 text-primary"
                onClick={() => window.location.href = '/support'}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * This error page provides:
 * 1. Clear error message
 * 2. Error tracking
 * 3. Recovery options
 * 4. Helpful suggestions
 * 5. Support access
 * 6. Error details
 * 7. Consistent layout
 */