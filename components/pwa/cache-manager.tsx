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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cloud,
  Download,
  Trash2,
  RefreshCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  LeafyGreen,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CacheItem {
  url: string;
  size: number;
  added: Date;
  type: string;
}

interface CacheInfo {
  name: string;
  size: number;
  items: CacheItem[];
  lastUpdated: Date;
}

interface CacheManagerProps {
  className?: string;
}

export function CacheManager({ className }: CacheManagerProps) {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState(0);

  // Fetch cache information
  const updateCacheInfo = async () => {
    if (!('caches' in window)) return;

    setIsLoading(true);
    try {
      const cacheNames = await window.caches.keys();
      const cacheInfos: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await window.caches.open(name);
        const requests = await cache.keys();
        const items: CacheItem[] = [];
        let totalSize = 0;

        for (const request of requests) {
          const response = await cache.match(request);
          if (!response) continue;

          // In a real app, you'd use more sophisticated size calculation
          const size = (await response.clone().text()).length;
          totalSize += size;

          items.push({
            url: request.url,
            size,
            added: new Date(response.headers.get("date") || Date.now()),
            type: response.headers.get("content-type") || "unknown",
          });
        }

        cacheInfos.push({
          name,
          size: totalSize,
          items,
          lastUpdated: new Date(),
        });
      }

      setCaches(cacheInfos);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void updateCacheInfo();
  }, []);

  // Clear specific cache
  const clearCache = async (cacheName: string) => {
    if (!('caches' in window)) return;

    setIsClearing(true);
    setClearProgress(0);

    try {
      const cache = await window.caches.open(cacheName);
      const requests = await cache.keys();
      const total = requests.length;
      let cleared = 0;

      for (const request of requests) {
        await cache.delete(request);
        cleared++;
        setClearProgress((cleared / total) * 100);
      }

      await updateCacheInfo();
    } finally {
      setIsClearing(false);
      setClearProgress(0);
    }
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

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LeafyGreen className="h-5 w-5" />
          Cache Management
        </CardTitle>
        <CardDescription>
          Manage your offline data like tending to a digital garden
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Sprout className="h-8 w-8 text-accent animate-bounce" />
          </div>
        ) : caches.length === 0 ? (
          <div className="text-center p-8 text-muted-text">
            <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No cached data found. Use the app to grow your offline garden.</p>
          </div>
        ) : (
          <>
            {/* Cache List */}
            <div className="space-y-4">
              {caches.map((cache) => (
                <div
                  key={cache.name}
                  className="rounded-lg border border-border p-4 space-y-4"
                >
                  {/* Cache Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{cache.name}</h4>
                      <p className="text-sm text-muted-text">
                        {formatSize(cache.size)} • {cache.items.length} items
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void clearCache(cache.name)}
                      disabled={isClearing}
                      className="group"
                    >
                      {isClearing ? (
                        <Sprout className="h-4 w-4 animate-bounce" />
                      ) : (
                        <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                      )}
                    </Button>
                  </div>

                  {/* Clear Progress */}
                  {isClearing && (
                    <Progress value={clearProgress} className="h-1" />
                  )}

                  {/* Cache Items */}
                  <div className="rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Added</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cache.items.slice(0, 5).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium truncate max-w-[200px]">
                              {new URL(item.url).pathname}
                            </TableCell>
                            <TableCell>{formatSize(item.size)}</TableCell>
                            <TableCell>{item.type.split("/")[1]}</TableCell>
                            <TableCell>
                              {item.added.toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Show More */}
                  {cache.items.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      Show {cache.items.length - 5} more items
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => void updateCacheInfo()}
                disabled={isLoading}
                className="group"
              >
                <RefreshCcw className={cn(
                  "mr-2 h-4 w-4 transition-transform",
                  isLoading ? "animate-spin" : "group-hover:rotate-180"
                )} />
                Refresh
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CacheManager;