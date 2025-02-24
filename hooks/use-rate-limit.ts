import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

interface RateLimitOptions {
  key?: string;
  max?: number;
  window?: number;
  onLimitReached?: () => void;
  redirectTo?: string;
}

export function useRateLimit({
  key = "default",
  max = 5,
  window = 60000, // 1 minute
  onLimitReached,
  redirectTo,
}: RateLimitOptions = {}) {
  const router = useRouter();
  const [info, setInfo] = useState<RateLimitInfo>({
    remaining: max,
    reset: Date.now() + window,
    total: max,
  });
  const [isBlocked, setIsBlocked] = useState(false);

  // Reset counter when window expires
  useEffect(() => {
    if (!isBlocked) return;

    const timeUntilReset = info.reset - Date.now();
    if (timeUntilReset <= 0) {
      setInfo({
        remaining: max,
        reset: Date.now() + window,
        total: max,
      });
      setIsBlocked(false);
      return;
    }

    const timer = setTimeout(() => {
      setInfo({
        remaining: max,
        reset: Date.now() + window,
        total: max,
      });
      setIsBlocked(false);
    }, timeUntilReset);

    return () => clearTimeout(timer);
  }, [isBlocked, info.reset, max, window]);

  // Check rate limit status from server
  const checkLimit = useCallback(async () => {
    try {
      const response = await fetch(`/api/rate-limit/${key}`);
      if (!response.ok) throw new Error("Failed to check rate limit");

      const data = await response.json() as RateLimitInfo;
      setInfo(data);
      setIsBlocked(data.remaining <= 0);

      return data;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return null;
    }
  }, [key]);

  // Increment attempt counter
  const increment = useCallback(async () => {
    if (isBlocked) {
      const timeUntilReset = Math.ceil((info.reset - Date.now()) / 1000);
      
      toast({
        title: "Too Many Attempts",
        description: `Please try again in ${timeUntilReset} seconds`,
        variant: "destructive",
      });

      if (redirectTo) {
        router.push(redirectTo);
      }

      onLimitReached?.();
      return false;
    }

    try {
      const response = await fetch(`/api/rate-limit/${key}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to increment rate limit");

      const data = await response.json() as RateLimitInfo;
      setInfo(data);
      
      const newIsBlocked = data.remaining <= 0;
      setIsBlocked(newIsBlocked);

      if (newIsBlocked) {
        const timeUntilReset = Math.ceil((data.reset - Date.now()) / 1000);
        
        toast({
          title: "Too Many Attempts",
          description: `Please try again in ${timeUntilReset} seconds`,
          variant: "destructive",
        });

        if (redirectTo) {
          router.push(redirectTo);
        }

        onLimitReached?.();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Rate limit increment failed:", error);
      return true; // Allow operation on error
    }
  }, [key, isBlocked, info.reset, router, redirectTo, onLimitReached]);

  // Get time until reset
  const getTimeUntilReset = useCallback(() => {
    const timeUntilReset = info.reset - Date.now();
    return Math.max(0, Math.ceil(timeUntilReset / 1000));
  }, [info.reset]);

  // Format remaining attempts message
  const getRemainingMessage = useCallback(() => {
    if (isBlocked) {
      const seconds = getTimeUntilReset();
      return `Too many attempts. Please try again in ${seconds} seconds`;
    }

    return `${info.remaining} attempts remaining`;
  }, [isBlocked, info.remaining, getTimeUntilReset]);

  return {
    isBlocked,
    info,
    increment,
    checkLimit,
    getTimeUntilReset,
    getRemainingMessage,
    remaining: info.remaining,
    total: info.total,
    resetTime: info.reset,
  };
}

export default useRateLimit;