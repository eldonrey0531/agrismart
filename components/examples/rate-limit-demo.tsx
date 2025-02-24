"use client";

import { useState } from "react";
import { useRateLimitStatus } from "@/hooks/use-rate-limit-status";
import { RateLimitIndicator } from "@/components/ui/rate-limit-indicator";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ActivitySquare, AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RateLimitDemo() {
  const [requestCount, setRequestCount] = useState(0);
  const {
    info,
    isLoading,
    isLimited,
    remainingPercentage,
    getProgressColor,
    refresh,
  } = useRateLimitStatus({
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const makeRequest = async () => {
    try {
      const response = await fetch("/api/rate-limit", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        setRequestCount(prev => prev + 1);
        await refresh();
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  // Map progress color to button variant
  const getButtonVariant = (): ButtonVariant => {
    if (isLimited) return "destructive";
    if (remainingPercentage <= 20) return "warning";
    if (remainingPercentage <= 40) return "secondary";
    return "accent";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Rate Limit Demo</CardTitle>
            <CardDescription>
              Test the rate limiting functionality by making requests
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={isLoading}
            className="text-muted-text hover:text-light-text"
          >
            <RefreshCcw className={cn(
              "h-4 w-4",
              isLoading && "animate-spin"
            )} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rate Limit Indicator */}
        <RateLimitIndicator showAlert={true} />

        {/* Request Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-text">
                    Requests Made
                  </p>
                  <p className="text-2xl font-bold">{requestCount}</p>
                </div>
                <ActivitySquare className="h-4 w-4 text-muted-text" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-text">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold">{info?.remaining || 0}</p>
                </div>
                <AlertCircle className={cn(
                  "h-4 w-4",
                  isLimited ? "text-destructive" : "text-muted-text"
                )} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Button */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={makeRequest}
            disabled={isLimited || isLoading}
            variant={getButtonVariant()}
            size="lg"
            className="w-full font-semibold"
          >
            Make Test Request
          </Button>

          {isLimited && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Rate limit reached. Please wait for the limit to reset.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Instructions */}
        <Alert>
          <AlertDescription className="text-sm text-muted-text">
            This demo shows how rate limiting works. Each request counts towards
            your rate limit. When the limit is reached, you'll need to wait for
            the reset period.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default RateLimitDemo;