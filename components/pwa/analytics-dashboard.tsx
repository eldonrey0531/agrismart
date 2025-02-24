"use client";

import { usePWAAnalytics } from "@/hooks/use-pwa-analytics";
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
  Activity,
  Clock,
  Database,
  Download,
  RefreshCcw,
  Wifi,
  Sprout,
  TreePine,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { metrics, refresh } = usePWAAnalytics();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case "4g":
        return "text-success";
      case "3g":
        return "text-accent";
      case "2g":
      case "slow-2g":
        return "text-warning";
      case "offline":
        return "text-destructive";
      default:
        return "text-muted-text";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Growth
          </CardTitle>
          <CardDescription>
            Watch your app flourish with optimized loading times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading Times */}
          <div className="space-y-4">
            {[
              {
                label: "First Paint",
                value: metrics.performance.timeToFirstPaint,
                icon: Sprout,
              },
              {
                label: "First Contentful Paint",
                value: metrics.performance.timeToFirstContentfulPaint,
                icon: Leaf,
              },
              {
                label: "Time to Interactive",
                value: metrics.performance.timeToInteractive,
                icon: TreePine,
              },
            ].map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <metric.icon className="h-4 w-4 text-accent" />
                    <span>{metric.label}</span>
                  </div>
                  <span className="text-muted-text">{formatTime(metric.value)}</span>
                </div>
                <Progress 
                  value={Math.min((metric.value / 5000) * 100, 100)}
                  className="h-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Health
          </CardTitle>
          <CardDescription>
            Monitor your app&apos;s resource consumption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Stats */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Storage</p>
                <p className="text-xl font-bold">
                  {formatSize(metrics.storage.usedSpace)} /{" "}
                  {formatSize(metrics.storage.totalQuota)}
                </p>
              </div>
              <Download className="h-8 w-8 text-accent opacity-50" />
            </div>
            <Progress 
              value={(metrics.storage.usedSpace / metrics.storage.totalQuota) * 100}
              className="h-2"
            />
          </div>

          {/* Cache Details */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Cached Resources</p>
                <p className="text-sm text-muted-text">
                  {metrics.storage.itemCount} items
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatSize(metrics.storage.cacheSize)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connectivity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Network Vitality
          </CardTitle>
          <CardDescription>
            Track your app&apos;s connection strength
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Stats */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Connection Type</p>
                <p className={cn(
                  "text-lg font-medium",
                  getConnectionColor(metrics.connectivity.effectiveType)
                )}>
                  {metrics.connectivity.effectiveType.toUpperCase()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-accent opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface/50">
                <p className="text-sm font-medium mb-1">Online Time</p>
                <p className="text-lg font-medium text-success">
                  {formatTime(metrics.connectivity.onlineTime)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface/50">
                <p className="text-sm font-medium mb-1">Reconnections</p>
                <p className="text-lg font-medium text-accent">
                  {metrics.connectivity.reconnections}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => void refresh()}
          className="group"
        >
          <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
          Refresh Metrics
        </Button>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;