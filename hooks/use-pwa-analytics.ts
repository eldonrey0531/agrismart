"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

// NetworkInformation API types
interface NetworkInformation extends EventTarget {
  readonly effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  onchange: EventListener;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

interface PerformanceMetrics {
  timeToFirstPaint: number;
  timeToFirstContentfulPaint: number;
  timeToInteractive: number;
  loadTime: number;
}

interface StorageMetrics {
  totalQuota: number;
  usedSpace: number;
  cacheSize: number;
  itemCount: number;
}

interface ConnectivityMetrics {
  onlineTime: number;
  offlineTime: number;
  reconnections: number;
  effectiveType: string;
  downlink?: number;
  rtt?: number;
}

interface InstallMetrics {
  installed: boolean;
  installTime?: Date;
  updateCount: number;
  lastUpdate?: Date;
}

interface PWAAnalytics {
  performance: PerformanceMetrics;
  storage: StorageMetrics;
  connectivity: ConnectivityMetrics;
  install: InstallMetrics;
}

const initialMetrics: PWAAnalytics = {
  performance: {
    timeToFirstPaint: 0,
    timeToFirstContentfulPaint: 0,
    timeToInteractive: 0,
    loadTime: 0,
  },
  storage: {
    totalQuota: 0,
    usedSpace: 0,
    cacheSize: 0,
    itemCount: 0,
  },
  connectivity: {
    onlineTime: 0,
    offlineTime: 0,
    reconnections: 0,
    effectiveType: "unknown",
  },
  install: {
    installed: false,
    updateCount: 0,
  },
};

export function usePWAAnalytics() {
  const [metrics, setMetrics] = useState<PWAAnalytics>(initialMetrics);
  const [isTracking, setIsTracking] = useState(false);

  // Track performance metrics
  const trackPerformance = () => {
    if (typeof window === "undefined" || !window.performance) return;

    const timing = window.performance.timing;
    const paint = window.performance.getEntriesByType("paint");
    
    const firstPaint = paint.find(entry => entry.name === "first-paint");
    const firstContentfulPaint = paint.find(
      entry => entry.name === "first-contentful-paint"
    );

    setMetrics(prev => ({
      ...prev,
      performance: {
        timeToFirstPaint: firstPaint?.startTime || 0,
        timeToFirstContentfulPaint: firstContentfulPaint?.startTime || 0,
        timeToInteractive: timing.domInteractive - timing.navigationStart,
        loadTime: timing.loadEventEnd - timing.navigationStart,
      },
    }));
  };

  // Track storage metrics
  const trackStorage = async () => {
    if (typeof window === "undefined" || !navigator.storage || !window.caches) return;

    try {
      const estimate = await navigator.storage.estimate();
      const cacheNames = await window.caches.keys();
      let totalCacheSize = 0;
      let totalItems = 0;

      for (const name of cacheNames) {
        const cache = await window.caches.open(name);
        const keys = await cache.keys();
        totalItems += keys.length;
        
        // Estimate cache size
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.clone().blob();
            totalCacheSize += blob.size;
          }
        }
      }

      setMetrics(prev => ({
        ...prev,
        storage: {
          totalQuota: estimate.quota || 0,
          usedSpace: estimate.usage || 0,
          cacheSize: totalCacheSize,
          itemCount: totalItems,
        },
      }));
    } catch (error) {
      console.error("Failed to track storage metrics:", error);
    }
  };

  // Track connectivity metrics
  const trackConnectivity = () => {
    if (typeof window === "undefined") return;

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const startTime = Date.now();
    let reconnections = 0;

    const handleOnline = () => {
      reconnections++;
      setMetrics(prev => ({
        ...prev,
        connectivity: {
          ...prev.connectivity,
          onlineTime: prev.connectivity.onlineTime + (Date.now() - startTime),
          reconnections,
          effectiveType: connection?.effectiveType || "unknown",
          downlink: connection?.downlink,
          rtt: connection?.rtt,
        },
      }));
    };

    const handleOffline = () => {
      setMetrics(prev => ({
        ...prev,
        connectivity: {
          ...prev.connectivity,
          offlineTime: prev.connectivity.offlineTime + (Date.now() - startTime),
          effectiveType: "offline",
        },
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (connection) {
      connection.addEventListener("change", () => {
        setMetrics(prev => ({
          ...prev,
          connectivity: {
            ...prev.connectivity,
            effectiveType: connection.effectiveType || "unknown",
            downlink: connection.downlink,
            rtt: connection.rtt,
          },
        }));
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", () => {});
      }
    };
  };

  // Track installation metrics
  const trackInstallation = () => {
    if (typeof window === "undefined") return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setMetrics(prev => ({
      ...prev,
      install: {
        ...prev.install,
        installed: isStandalone,
        installTime: isStandalone ? new Date() : undefined,
      },
    }));

    // Track updates
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setMetrics(prev => ({
          ...prev,
          install: {
            ...prev.install,
            updateCount: prev.install.updateCount + 1,
            lastUpdate: new Date(),
          },
        }));

        toast({
          title: "App Updated",
          description: "Your garden has grown with new improvements!",
          variant: "default",
        });
      });
    }
  };

  // Start tracking
  useEffect(() => {
    if (isTracking || typeof window === "undefined") return;
    setIsTracking(true);

    trackPerformance();
    void trackStorage();
    const cleanupConnectivity = trackConnectivity();
    trackInstallation();

    // Periodic updates
    const storageInterval = setInterval(() => void trackStorage(), 60000); // Every minute

    return () => {
      cleanupConnectivity?.();
      clearInterval(storageInterval);
    };
  }, [isTracking]);

  return {
    metrics,
    refresh: async () => {
      trackPerformance();
      await trackStorage();
    },
  };
}

export default usePWAAnalytics;