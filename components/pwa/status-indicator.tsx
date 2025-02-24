"use client";

import { useEffect, useState } from "react";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  Wifi, 
  CloudOff, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Sprout,
  Leaf 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  className?: string;
  minimal?: boolean;
}

export function StatusIndicator({ className, minimal = false }: StatusIndicatorProps) {
  const { isSupported, isRegistered, isOffline, update } = useServiceWorker();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Get connection speed
  const [connectionSpeed, setConnectionSpeed] = useState<string>("");
  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const updateConnectionSpeed = () => {
        const speed = connection.effectiveType || "unknown";
        setConnectionSpeed(speed);
      };
      updateConnectionSpeed();
      connection.addEventListener("change", updateConnectionSpeed);
      return () => connection.removeEventListener("change", updateConnectionSpeed);
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await update();
      setLastChecked(new Date());
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isSupported || !isRegistered) return null;

  // Minimal version (just icon)
  if (minimal) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative w-8 h-8",
              isOffline && "text-destructive",
              className
            )}
          >
            {isOffline ? (
              <CloudOff className="h-4 w-4 animate-bounce-slow" />
            ) : (
              <Wifi className="h-4 w-4 animate-pulse" />
            )}
            {/* Status Dot */}
            <span className={cn(
              "absolute top-1 right-1 w-2 h-2 rounded-full",
              isOffline ? "bg-destructive" : "bg-success",
              "animate-pulse"
            )} />
          </Button>
        </HoverCardTrigger>
        <StatusDetails
          isOffline={isOffline}
          connectionSpeed={connectionSpeed}
          lastChecked={lastChecked}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      </HoverCard>
    );
  }

  // Full version
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant={isOffline ? "destructive" : "outline"}
            size="sm"
            className="gap-2 group"
          >
            {isOffline ? (
              <>
                <CloudOff className="h-4 w-4 animate-bounce-slow" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 group-hover:animate-pulse" />
                <span>Online</span>
              </>
            )}
          </Button>
        </HoverCardTrigger>
        <StatusDetails
          isOffline={isOffline}
          connectionSpeed={connectionSpeed}
          lastChecked={lastChecked}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      </HoverCard>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleUpdate}
        disabled={isUpdating}
        className="group"
      >
        {isUpdating ? (
          <Sprout className="h-4 w-4 animate-bounce" />
        ) : (
          <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
        )}
      </Button>
    </div>
  );
}

// Status Details Component
function StatusDetails({
  isOffline,
  connectionSpeed,
  lastChecked,
  onUpdate,
  isUpdating,
}: {
  isOffline: boolean;
  connectionSpeed: string;
  lastChecked: Date | null;
  onUpdate: () => Promise<void>;
  isUpdating: boolean;
}) {
  return (
    <HoverCardContent side="bottom" align="start" className="w-80">
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-start gap-4">
          {isOffline ? (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-sm font-medium mb-1">
              {isOffline ? "Currently Offline" : "Connection Active"}
            </h4>
            <p className="text-sm text-muted-text">
              {isOffline
                ? "Your changes will sync when connection is restored"
                : `Connected with ${connectionSpeed} speed`}
            </p>
          </div>
        </div>

        {/* Update Status */}
        <div className="flex items-start gap-4">
          <Leaf className="h-5 w-5 text-accent shrink-0 mt-0.5 animate-float-slow" />
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-1">App Updates</h4>
            <p className="text-sm text-muted-text">
              {lastChecked
                ? `Last checked ${lastChecked.toLocaleTimeString()}`
                : "Check for updates to grow new features"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdate}
            disabled={isUpdating}
            className="shrink-0 group"
          >
            {isUpdating ? (
              <Sprout className="h-4 w-4 animate-bounce" />
            ) : (
              <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            )}
          </Button>
        </div>
      </div>
    </HoverCardContent>
  );
}

export default StatusIndicator;