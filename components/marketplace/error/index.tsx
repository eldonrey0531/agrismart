'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Marketplace error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] container flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground max-w-[500px]">
            {error.message === "Failed to fetch"
              ? "Could not connect to the server. Please check your internet connection and try again."
              : "An unexpected error occurred. Our team has been notified and we're working to fix it."}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <a href="/marketplace">Return to Marketplace</a>
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <p className="text-sm font-mono break-all text-muted-foreground">
              {error.message}
              {error.digest && (
                <>
                  <br />
                  <span className="opacity-50">Digest: {error.digest}</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}