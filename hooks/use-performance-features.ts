import { useEffect, useState, useCallback } from 'react';
import { createElement } from 'react';
import { usePerformanceMonitor } from '@/lib/utils/performance-monitor';
import type { ComponentType, ReactElement, JSXElementConstructor } from 'react';

interface PerformanceConfig {
  enableLazyLoading?: boolean;
  enablePrefetching?: boolean;
  monitorMetrics?: boolean;
  componentName?: string;
}

interface PerformanceMetrics {
  mountTime: number;
  renderTime: number;
  interactionTime?: number;
  networkType?: string;
  rtt?: number;
  downlink?: number;
  memoryUsage?: number;
  loadTime?: number;
}

interface PerformanceFeatures {
  isLoading: boolean;
  lazyLoad: <T>(importFn: () => Promise<T>) => Promise<T>;
  prefetch: <T>(importFn: () => Promise<T>) => void;
  metrics: PerformanceMetrics;
}

export function usePerformanceFeatures(config: PerformanceConfig = {}): PerformanceFeatures {
  const {
    enableLazyLoading = true,
    enablePrefetching = true,
    monitorMetrics = true,
    componentName = 'UnnamedComponent',
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    mountTime: 0,
    renderTime: 0,
  });

  // Initialize performance monitoring
  const perfMonitor = usePerformanceMonitor(componentName);

  // Lazy loading implementation
  const lazyLoad = useCallback(async <T>(importFn: () => Promise<T>): Promise<T> => {
    if (!enableLazyLoading) {
      return importFn();
    }

    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      const result = await importFn();
      
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        loadTime,
      }));

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [enableLazyLoading]);

  // Prefetching implementation
  const prefetch = useCallback(<T>(importFn: () => Promise<T>): void => {
    if (!enablePrefetching) return;

    // Use requestIdleCallback if available, otherwise use setTimeout
    const schedulePreload = window.requestIdleCallback || window.setTimeout;

    schedulePreload(() => {
      importFn().catch(() => {
        // Silently ignore prefetch errors
      });
    });
  }, [enablePrefetching]);

  // Intersection Observer for viewport-based lazy loading
  useEffect(() => {
    if (!enableLazyLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const lazyAttribute = element.getAttribute('data-lazy');
            
            if (lazyAttribute) {
              try {
                const importPath = lazyAttribute;
                import(/* @vite-ignore */ importPath).catch(error => {
                  console.warn('Failed to lazy load:', error);
                });
              } catch (error) {
                console.warn('Failed to lazy load:', error);
              }
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    // Observe elements with data-lazy attribute
    document.querySelectorAll('[data-lazy]').forEach(element => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [enableLazyLoading]);

  // Network condition monitoring
  useEffect(() => {
    if (!monitorMetrics) return;

    const connection = (navigator as any).connection;
    
    if (connection) {
      const updateConnectionMetrics = () => {
        setMetrics(prev => ({
          ...prev,
          networkType: connection.effectiveType,
          rtt: connection.rtt,
          downlink: connection.downlink,
        }));
      };

      connection.addEventListener('change', updateConnectionMetrics);
      updateConnectionMetrics();

      return () => {
        connection.removeEventListener('change', updateConnectionMetrics);
      };
    }
  }, [monitorMetrics]);

  // Memory usage monitoring
  useEffect(() => {
    if (!monitorMetrics) return;

    const checkMemoryUsage = () => {
      if ((performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory.usedJSHeapSize,
        }));
      }
    };

    const interval = setInterval(checkMemoryUsage, 5000);
    checkMemoryUsage();

    return () => {
      clearInterval(interval);
    };
  }, [monitorMetrics]);

  return {
    isLoading,
    lazyLoad,
    prefetch,
    metrics,
  };
}

// Helper function to add lazy loading to an element
export function markAsLazy(element: HTMLElement, importPath: string): void {
  element.setAttribute('data-lazy', importPath);
}

// Helper types for lazy loading
type LazyComponentModule<P = {}> = { default: ComponentType<P> };

// Helper function to create a lazy component loader
export function createLazyLoader<P extends object = {}>(
  importFn: () => Promise<LazyComponentModule<P>>,
  fallback?: ReactElement | null
): ComponentType<P> {
  return function LazyLoader(props: P): ReactElement | null {
    const { lazyLoad, isLoading } = usePerformanceFeatures();
    const [LoadedComponent, setLoadedComponent] = useState<ComponentType<P> | null>(null);

    useEffect(() => {
      lazyLoad(importFn)
        .then(module => {
          setLoadedComponent(() => module.default);
        })
        .catch(error => {
          console.error('Failed to load component:', error);
        });
    }, []);

    if (isLoading && fallback) {
      return fallback;
    }

    return LoadedComponent ? createElement(LoadedComponent, props) : null;
  };
}