"use client";

import { useEffect, useState } from "react";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ActivitySquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  CloudOff,
  Loader2,
  RefreshCcw,
  Sprout,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStats {
  totalSyncs: number;
  recentSyncs: number;
  failedSyncs: number;
  averageDuration: number;
  lastSync?: Date;
  healthScore: number;
}

interface SyncStatusProps {
  className?: string;
  userId: string;
}

export function SyncStatus({ className, userId }: SyncStatusProps) {
  const { isOnline } = useServiceWorker();
  const { pendingItems, syncPendingItems } = useOfflineSync();
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch sync stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/sync/stats?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch sync stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch sync stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and refresh interval
  useEffect(() => {
    void fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [userId]);

  // Format time duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diff = Math.round((date.getTime() - Date.now()) / 1000 / 60);
    
    if (Math.abs(diff) < 60) {
      return rtf.format(diff, "minute");
    }
    return rtf.format(Math.round(diff / 60), "hour");
  };

  // Get health status
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: "Thriving", color: "text-success" };
    if (score >= 70) return { label: "Growing", color: "text-accent" };
    if (score >= 50) return { label: "Stable", color: "text-warning" };
    return { label: "Needs Care", color: "text-destructive" };
  };

  // Handle manual sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingItems();
      await fetchStats();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivitySquare className="h-5 w-5" />
          Sync Health
        </CardTitle>
        <CardDescription>
          Monitor your data&apos;s growth and synchronization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-success animate-pulse" />
            ) : (
              <CloudOff className="h-5 w-5 text-destructive animate-bounce-slow" />
            )}
            <div>
              <p className="font-medium">
                {isOnline ? "Connected" : "Offline"}
              </p>
              <p className="text-sm text-muted-text">
                {pendingItems.length} items waiting to sync
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className="group"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Sprout className="h-8 w-8 text-accent animate-bounce" />
          </div>
        ) : stats ? (
          <>
            {/* Health Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Sync Health</p>
                <p className={cn(
                  "text-sm font-medium",
                  getHealthStatus(stats.healthScore).color
                )}>
                  {getHealthStatus(stats.healthScore).label}
                </p>
              </div>
              <Progress 
                value={stats.healthScore}
                className="h-2"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Recent Activity */}
              <div className="space-y-4 p-4 rounded-lg bg-surface/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Recent Activity</p>
                    <p className="text-2xl font-bold">{stats.recentSyncs}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-text">
                  syncs in last 24 hours
                </p>
              </div>

              {/* Success Rate */}
              <div className="space-y-4 p-4 rounded-lg bg-surface/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {((1 - stats.failedSyncs / stats.totalSyncs) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-text">
                  {stats.failedSyncs} failed syncs total
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <h4 className="text-sm font-medium">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-text">Average Sync Time</p>
                  <p>{formatDuration(stats.averageDuration)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-text">Total Syncs</p>
                  <p>{stats.totalSyncs}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-text">Last Successful Sync</p>
                  <p>{stats.lastSync ? formatRelativeTime(new Date(stats.lastSync)) : "Never"}</p>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            {stats.healthScore < 70 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sync Health Warning</p>
                  <p className="text-sm opacity-90">
                    Your sync health needs attention. Consider checking your connection
                    and reviewing failed syncs.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-text">
            <p>Could not load sync statistics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SyncStatus;