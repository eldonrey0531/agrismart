"use client";

import { useEffect, useState } from "react";
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
  Database,
  HardDrive,
  Image,
  FileText,
  Trash2,
  TreePine,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageInfo {
  total: number;
  used: number;
  quota: number;
  details: {
    images: number;
    cache: number;
    other: number;
  };
}

interface StorageUsageProps {
  className?: string;
  onClearCache?: () => Promise<void>;
}

export function StorageUsage({ className, onClearCache }: StorageUsageProps) {
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const updateStorageInfo = async () => {
    if (!navigator.storage) return;

    setIsLoading(true);
    try {
      // Get storage estimate
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;

      // Get cache size
      const cacheSize = await getCacheSize();

      // Simulated image size (in real app, calculate from IndexedDB/Cache)
      const imageSize = Math.floor(usage * 0.4); // Example: 40% of usage

      setStorage({
        total: quota,
        used: usage,
        quota: quota,
        details: {
          images: imageSize,
          cache: cacheSize,
          other: usage - (imageSize + cacheSize),
        },
      });
    } catch (error) {
      console.error("Failed to get storage info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCacheSize = async (): Promise<number> => {
    if (!('caches' in window)) return 0;
    
    try {
      const caches = await window.caches.keys();
      let total = 0;

      // In a real app, you'd calculate actual cache sizes
      // This is a simplified example
      for (const cacheName of caches) {
        const cache = await window.caches.open(cacheName);
        const keys = await cache.keys();
        total += keys.length * 1024 * 10; // Assume 10KB per cached item
      }

      return total;
    } catch {
      return 0;
    }
  };

  const handleClearCache = async () => {
    if (!onClearCache) return;

    setIsClearing(true);
    try {
      await onClearCache();
      await updateStorageInfo();
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    void updateStorageInfo();
  }, []);

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

  if (!storage) return null;

  const usagePercent = (storage.used / storage.quota) * 100;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </CardTitle>
        <CardDescription>
          Monitor your app&apos;s storage like tracking a garden&apos;s growth
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-text">
              {formatSize(storage.used)} of {formatSize(storage.quota)} used
            </span>
            <span className="text-muted-text">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={usagePercent} 
            className="h-2 bg-surface"
          />
        </div>

        {/* Usage Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Storage Breakdown</h4>
          
          {/* Cache Storage */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-surface/50 hover:bg-surface/80 transition-colors">
            <Database className="h-5 w-5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Cache Storage</p>
                <span className="text-sm text-muted-text">
                  {formatSize(storage.details.cache)}
                </span>
              </div>
              <Progress 
                value={(storage.details.cache / storage.used) * 100}
                className="h-1 mt-2 bg-surface"
              />
            </div>
          </div>

          {/* Image Files */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-surface/50 hover:bg-surface/80 transition-colors">
            <Image className="h-5 w-5 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Images</p>
                <span className="text-sm text-muted-text">
                  {formatSize(storage.details.images)}
                </span>
              </div>
              <Progress 
                value={(storage.details.images / storage.used) * 100}
                className="h-1 mt-2 bg-surface"
              />
            </div>
          </div>

          {/* Other Data */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-surface/50 hover:bg-surface/80 transition-colors">
            <FileText className="h-5 w-5 text-interactive shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Other Data</p>
                <span className="text-sm text-muted-text">
                  {formatSize(storage.details.other)}
                </span>
              </div>
              <Progress 
                value={(storage.details.other / storage.used) * 100}
                className="h-1 mt-2 bg-surface"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => void updateStorageInfo()}
            disabled={isLoading}
            className="group"
          >
            <RefreshCcw className={cn(
              "mr-2 h-4 w-4 transition-transform",
              isLoading ? "animate-spin" : "group-hover:rotate-180"
            )} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleClearCache()}
            disabled={isClearing}
            className="group"
          >
            {isClearing ? (
              <TreePine className="mr-2 h-4 w-4 animate-bounce" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StorageUsage;