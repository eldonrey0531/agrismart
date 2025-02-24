'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Login error:', error);
  }, [error]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Authentication Error
            </h1>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
              {error.message === 'INVALID_CREDENTIALS'
                ? 'Invalid email or password. Please try again.'
                : 'An error occurred during authentication. Please try again.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => reset()}
            variant="default"
          >
            Try Again
          </Button>
          <Button 
            variant="outline"
            asChild
          >
            <a href="/login">Back to Login</a>
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm font-mono break-all text-muted-foreground text-left">
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