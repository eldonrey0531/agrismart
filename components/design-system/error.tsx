'use client';

import React from 'react';
import { Container, Button } from '@/components/ui/base';

export default function DesignSystemError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Container className="relative">
        <div className="text-center space-y-8">
          {/* Error icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-surface/50 flex items-center justify-center mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            
            <p className="text-muted-foreground max-w-md mx-auto">
              {error.message || 'An error occurred while loading the design system content.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={reset}
                size="lg"
                className="bg-accent text-foreground-dark hover:bg-accent/90"
              >
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-foreground-dark"
              >
                Return Home
              </Button>
            </div>
          </div>

          {/* Technical details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-surface/50 rounded-lg max-w-2xl mx-auto">
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Technical Details
                </summary>
                <pre className="text-xs overflow-auto p-2 bg-background rounded">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
        </div>
      </Container>

      {/* Accessibility announcement */}
      <div className="sr-only" role="alert" aria-live="assertive">
        Error: {error.message}
      </div>
    </div>
  );
}

// Optional: Add error boundary with more context
export function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Error Code: {error.digest}</h2>
          <p className="text-muted-foreground">
            The design system encountered an unexpected error.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </Container>
    </div>
  );
}