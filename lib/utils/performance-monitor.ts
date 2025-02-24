import { useEffect, useRef } from 'react';

// Performance entry types
export interface WebVitalMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export interface ResourceMetric {
  name: string;
  duration: number;
  transferSize: number;
  initiatorType: string;
}

export interface NavigationMetric {
  domComplete: number;
  loadEventEnd: number;
  domInteractive: number;
  type: string;
}

export interface PerformanceMetrics {
  mountTime: number;
  renderTime: number;
  interactionTime?: number;
  networkType?: string;
  rtt?: number;
  downlink?: number;
  memoryUsage?: number;
  loadTime?: number;
  componentName?: string;
  webVitals?: WebVitalMetric[];
  resources?: ResourceMetric[];
  navigation?: NavigationMetric;
  error?: boolean;
  errorDetails?: string;
}

export interface PerformanceConfig {
  enableLazyLoading?: boolean;
  enablePrefetching?: boolean;
  monitorMetrics?: boolean;
  componentName?: string;
}

export interface PerformanceFeatures {
  isLoading: boolean;
  lazyLoad: <T>(importFn: () => Promise<T>) => Promise<T>;
  prefetch: <T>(importFn: () => Promise<T>) => void;
  metrics: PerformanceMetrics;
  logInteraction: () => void;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]>;
  private observers: Set<(metrics: PerformanceMetrics) => void>;

  private constructor() {
    this.metrics = new Map();
    this.observers = new Set();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public recordMetric(name: string, value: number): void {
    this.recordMetrics(name, { [name]: value });
  }

  public recordMetrics(componentName: string, metrics: Partial<PerformanceMetrics>): void {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    const currentMetrics = this.metrics.get(componentName) || [];
    const updatedMetrics = {
      ...currentMetrics[currentMetrics.length - 1],
      ...metrics,
      timestamp: Date.now(),
    } as PerformanceMetrics;

    currentMetrics.push(updatedMetrics);
    this.metrics.set(componentName, currentMetrics);

    // Notify observers
    this.observers.forEach(observer => observer(updatedMetrics));
  }

  public getMetrics(componentName: string): PerformanceMetrics[] {
    return this.metrics.get(componentName) || [];
  }

  public getComponentMetrics(componentName: string): PerformanceMetrics[] {
    return this.getMetrics(componentName);
  }

  public getAverageMetric(name: string): number {
    const metrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => m[name as keyof PerformanceMetrics] !== undefined)
      .map(m => m[name as keyof PerformanceMetrics] as number);

    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  public clearMetrics(): void {
    this.metrics.clear();
  }
}

// Main monitoring hook that provides all performance features
export function usePerformanceFeatures(config: PerformanceConfig = {}): PerformanceFeatures {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = useRef(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - startTime.current;
    
    monitor.recordMetrics(config.componentName || 'unknown', {
      mountTime,
      renderTime: performance.now() - startTime.current,
    });

    return () => {
      monitor.recordMetrics(config.componentName || 'unknown', {
        mountTime,
        renderTime: performance.now() - startTime.current,
      });
    };
  }, [config.componentName]);

  return {
    isLoading: false,
    lazyLoad: async <T>(importFn: () => Promise<T>) => {
      const startTime = performance.now();
      try {
        const result = await importFn();
        monitor.recordMetrics(config.componentName || 'unknown', {
          loadTime: performance.now() - startTime,
        });
        return result;
      } catch (error) {
        monitor.recordMetrics(config.componentName || 'unknown', {
          loadTime: performance.now() - startTime,
          error: true,
          errorDetails: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    prefetch: <T>(importFn: () => Promise<T>) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          importFn().catch(() => {});
        });
      } else {
        setTimeout(() => {
          importFn().catch(() => {});
        }, 0);
      }
    },
    metrics: monitor.getMetrics(config.componentName || 'unknown')[0] || {
      mountTime: 0,
      renderTime: 0,
    },
    logInteraction: () => {
      monitor.recordMetrics(config.componentName || 'unknown', {
        interactionTime: performance.now(),
      });
    },
  };
}

// Web Vitals monitoring
export function monitorWebVitals(): () => void {
  const monitor = PerformanceMonitor.getInstance();

  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observers: PerformanceObserver[] = [];

  try {
    const webVitalsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        monitor.recordMetric(entry.name, entry.startTime);
      });
    });

    webVitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    observers.push(webVitalsObserver);

  } catch (error) {
    console.warn('Web Vitals monitoring not supported:', error);
  }

  return () => {
    observers.forEach(observer => observer.disconnect());
  };
}

// Performance measurement utility
export function withPerformanceMark<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-measure`;

    performance.mark(startMark);
    const result = fn(...args);
    performance.mark(endMark);
    
    try {
      performance.measure(measureName, startMark, endMark);
      const measures = performance.getEntriesByName(measureName);
      if (measures.length > 0) {
        PerformanceMonitor.getInstance().recordMetric(name, measures[0].duration);
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }

    return result;
  }) as T;
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();