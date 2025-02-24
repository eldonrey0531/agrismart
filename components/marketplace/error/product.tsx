'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="container max-w-6xl py-16">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground max-w-[500px]">
          {error.message === 'NOT_FOUND'
            ? 'The product you are looking for could not be found.'
            : 'There was a problem loading this product. Please try again.'}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" asChild>
            <a href="/marketplace">Back to Marketplace</a>
          </Button>
        </div>
      </div>
    </div>
  );
}