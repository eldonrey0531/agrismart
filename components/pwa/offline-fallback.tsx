"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudOff, Wifi, RefreshCcw, LeafyGreen, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineFallbackProps {
  className?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => Promise<void>;
}

export function OfflineFallback({
  className,
  message = "You're currently offline, like a plant without water. We'll keep trying to reconnect.",
  actionLabel = "Try Again",
  onRetry,
}: OfflineFallbackProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isRetrying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsRetrying(false);
            setProgress(0);
            return 0;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isRetrying]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setProgress(0);

    try {
      await onRetry?.();
    } catch {
      // Failed to reconnect
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={cn(
      "min-h-[300px] flex flex-col items-center justify-center p-6 text-center",
      className
    )}>
      {/* Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-background rounded-full p-4 inline-flex">
          {isOnline ? (
            <Wifi className="h-8 w-8 text-success animate-float-slow" />
          ) : (
            <CloudOff className="h-8 w-8 text-destructive animate-bounce-slow" />
          )}
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold mb-2">
        {isOnline ? "Connection Restored" : "No Connection"}
      </h3>
      <p className="text-muted-text mb-6 max-w-md">
        {message}
      </p>

      {/* Retry Progress */}
      {isRetrying && (
        <div className="w-full max-w-xs mb-6">
          <Progress value={progress} className="h-1" />
          <p className="text-sm text-muted-text mt-2">
            Attempting to reconnect...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="group"
        >
          <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
          Refresh Page
        </Button>
        <Button
          variant={isOnline ? "success" : "destructive"}
          onClick={handleRetry}
          disabled={isRetrying}
          className="group"
        >
          {isRetrying ? (
            <Sprout className="mr-2 h-4 w-4 animate-bounce" />
          ) : (
            <LeafyGreen className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          )}
          {actionLabel}
        </Button>
      </div>

      {/* Retry Count */}
      {retryCount > 0 && (
        <p className="text-sm text-muted-text mt-4">
          Retried {retryCount} {retryCount === 1 ? "time" : "times"}
        </p>
      )}

      {/* Natural Background */}
      <div className="absolute -z-10 inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-destructive/5 to-transparent blur-2xl" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-success/5 to-transparent blur-2xl" />
        </div>

        {/* Organic Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${getComputedStyle(document.documentElement).getPropertyValue('--border')} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
    </div>
  );
}

export default OfflineFallback;