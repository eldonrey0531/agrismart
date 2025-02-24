'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import type {
  PerformanceFeatures,
  PerformanceConfig,
  PerformanceMetrics,
  WebVitalMetric,
  ResourceMetric,
  NavigationMetric,
} from '@/lib/utils/performance-monitor';
import { usePerformanceFeatures, monitorWebVitals } from '@/lib/utils/performance-monitor';

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enablePrefetching?: boolean;
  monitorMetrics?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceContext = createContext<PerformanceFeatures | null>(null);

export function PerformanceProvider({
  children,
  enableLazyLoading = true,
  enablePrefetching = true,
  monitorMetrics = true,
  onMetricsUpdate,
}: PerformanceProviderProps) {
  const performance = usePerformanceFeatures({
    enableLazyLoading,
    enablePrefetching,
    monitorMetrics,
    componentName: 'PerformanceProvider',
  });

  const observersRef = useRef<{
    webVitals?: PerformanceObserver;
    resources?: PerformanceObserver;
    navigation?: PerformanceObserver;
  }>({});

  // Initialize Web Vitals monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !monitorMetrics) return;

    try {
      // Core Web Vitals
      if ('observe' in PerformanceObserver.prototype) {
        const webVitalsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            const webVital: WebVitalMetric = {
              name: entry.name,
              value: 'startTime' in entry ? entry.startTime : 0,
              rating: 'rating' in entry ? (entry as any).rating : undefined,
            };

            onMetricsUpdate?.({
              ...performance.metrics,
              webVitals: [...(performance.metrics.webVitals || []), webVital],
            });
          });
        });

        webVitalsObserver.observe({
          entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
        });

        observersRef.current.webVitals = webVitalsObserver;
      }

      // Resource timing
      const resourceObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            const resource: ResourceMetric = {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              transferSize: resourceEntry.transferSize,
              initiatorType: resourceEntry.initiatorType,
            };

            onMetricsUpdate?.({
              ...performance.metrics,
              resources: [...(performance.metrics.resources || []), resource],
            });
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      observersRef.current.resources = resourceObserver;

      // Navigation timing
      const navigationObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const navigation: NavigationMetric = {
              domComplete: navEntry.domComplete,
              loadEventEnd: navEntry.loadEventEnd,
              domInteractive: navEntry.domInteractive,
              type: navEntry.type,
            };

            onMetricsUpdate?.({
              ...performance.metrics,
              navigation,
            });
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      observersRef.current.navigation = navigationObserver;

      // Initialize web vitals monitoring
      const cleanup = monitorWebVitals();

      return () => {
        cleanup();
        Object.values(observersRef.current).forEach(observer => {
          observer?.disconnect();
        });
      };
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }, [monitorMetrics, performance.metrics, onMetricsUpdate]);

  return (
    <PerformanceContext.Provider value={performance}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Custom hook to use performance features
export function usePerformance(): PerformanceFeatures {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Higher-order component to wrap components with performance monitoring
export function withPerformance<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Partial<PerformanceConfig> = {}
): React.ComponentType<P> {
  const componentName = options.componentName || WrappedComponent.displayName || WrappedComponent.name;

  function PerformanceWrappedComponent(props: P) {
    const performance = usePerformance();

    useEffect(() => {
      performance.logInteraction();
    }, []);

    return React.createElement(WrappedComponent, props);
  }

  PerformanceWrappedComponent.displayName = `withPerformance(${componentName})`;
  return PerformanceWrappedComponent;
}