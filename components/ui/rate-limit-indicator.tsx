"use client";

import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

interface RateLimitIndicatorProps {
  className?: string;
  showAlert?: boolean;
  refreshInterval?: number;
}

export function RateLimitIndicator({
  className,
  showAlert = true,
  refreshInterval = 10000, // 10 seconds
}: RateLimitIndicatorProps) {
  const [info, setInfo] = useState<RateLimitInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRateLimit = useCallback(async () => {
    try {
      const response = await fetch("/api/rate-limit", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rate limit");
      }

      const data = await response.json();
      setInfo(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rate limit");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRateLimit();
    
    // Set up polling interval
    const interval = setInterval(fetchRateLimit, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchRateLimit, refreshInterval]);

  // Calculate percentage of remaining requests
  const remainingPercentage = info
    ? (info.remaining / info.total) * 100
    : 100;

  // Calculate time until reset
  const timeUntilReset = info
    ? Math.max(0, Math.ceil((info.reset - Date.now()) / 1000))
    : 0;

  // Format time until reset
  const formatTimeUntilReset = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Determine progress color based on remaining percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage <= 20) return "bg-destructive";
    if (percentage <= 40) return "bg-warning";
    return "bg-primary";
  };

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <Progress value={100} className="bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{info?.remaining || 0} requests remaining</span>
          <span>Reset in {formatTimeUntilReset(timeUntilReset)}</span>
        </div>
        <Progress
          value={remainingPercentage}
          className={cn(getProgressColor(remainingPercentage))}
        />
      </div>

      {/* Alert for low remaining requests */}
      {showAlert && info && info.remaining <= info.total * 0.2 && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {info.remaining === 0
              ? "Rate limit exceeded. Please wait before making more requests."
              : `Running low on requests (${info.remaining} remaining). Limit will reset in ${formatTimeUntilReset(
                  timeUntilReset
                )}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Error state */}
      {error && showAlert && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default RateLimitIndicator;