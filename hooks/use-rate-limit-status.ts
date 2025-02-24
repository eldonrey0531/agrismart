import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import type { ToastVariant } from "@/types/toast";

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

interface RateLimitStatusOptions {
  endpoint?: string;
  refreshInterval?: number;
  onLimitReached?: () => void;
  showToasts?: boolean;
}

export function useRateLimitStatus({
  endpoint = "/api/rate-limit",
  refreshInterval = 10000,
  onLimitReached,
  showToasts = true,
}: RateLimitStatusOptions = {}) {
  const [info, setInfo] = useState<RateLimitInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  // Calculate status
  const remainingPercentage = info
    ? (info.remaining / info.total) * 100
    : 100;

  const timeUntilReset = info
    ? Math.max(0, Math.ceil((info.reset - Date.now()) / 1000))
    : 0;

  const isLimited = info?.remaining === 0;

  // Format time until reset
  const formatTimeUntilReset = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  // Fetch rate limit info
  const fetchRateLimit = useCallback(async (showError = true) => {
    try {
      const response = await fetch(endpoint, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rate limit");
      }

      const data = await response.json() as RateLimitInfo;
      setInfo(data);
      setError(null);

      // Check if limit is reached
      if (data.remaining === 0) {
        onLimitReached?.();
        if (showToasts) {
          toast({
            title: "Rate Limit Reached",
            description: `Please wait ${formatTimeUntilReset(
              Math.ceil((data.reset - Date.now()) / 1000)
            )} before making more requests.`,
            variant: "destructive",
          });
        }
      }
      // Show warning when running low
      else if (data.remaining <= data.total * 0.2 && showToasts) {
        toast({
          title: "Running Low on Requests",
          description: `${data.remaining} requests remaining. Limit resets in ${formatTimeUntilReset(
            Math.ceil((data.reset - Date.now()) / 1000)
          )}.`,
          variant: "default",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch rate limit";
      setError(message);
      if (showError && showToasts) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, formatTimeUntilReset, onLimitReached, showToasts]);

  // Set up polling
  useEffect(() => {
    fetchRateLimit();

    if (refreshInterval > 0) {
      timerRef.current = setInterval(() => {
        fetchRateLimit(false); // Don't show errors for background updates
      }, refreshInterval);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [fetchRateLimit, refreshInterval]);

  // Get variant for UI components
  const getVariant = useCallback((percentage: number): ToastVariant => {
    if (percentage <= 20) return "destructive";
    if (percentage <= 40) return "default";
    return "default";
  }, []);

  return {
    info,
    error,
    isLoading,
    isLimited,
    remainingPercentage,
    timeUntilReset,
    formatTimeUntilReset,
    refresh: () => fetchRateLimit(),
    // Helper methods
    getProgressColor: () => getVariant(remainingPercentage),
    getRemainingText: () => {
      if (!info) return "Loading...";
      if (isLimited) return "No requests remaining";
      return `${info.remaining} request${info.remaining === 1 ? "" : "s"} remaining`;
    },
    getResetText: () => {
      if (!info) return "";
      return `Reset in ${formatTimeUntilReset(timeUntilReset)}`;
    },
  };
}

export type { RateLimitInfo };
export default useRateLimitStatus;