import React, { useEffect, useState } from 'react';
import { FormPerformanceMonitor } from '@/lib/utils/form-performance';
import { Chart } from 'chart.js/auto';

interface FormMetricsProps {
  formId: string;
  refreshInterval?: number; // Refresh interval in milliseconds
  showDetailedMetrics?: boolean;
}

interface MetricsData {
  loadTime: number[];
  interactionDelay: number[];
  submissionTime: number[];
  validationTime: number[];
  networkTime: number[];
  totalTime: number[];
  timestamps: string[];
  interactionCounts: {
    fields: Record<string, number>;
    errors: Record<string, number>;
    validations: number;
    submissions: number;
  };
}

const DEFAULT_METRICS: MetricsData = {
  loadTime: [],
  interactionDelay: [],
  submissionTime: [],
  validationTime: [],
  networkTime: [],
  totalTime: [],
  timestamps: [],
  interactionCounts: {
    fields: {},
    errors: {},
    validations: 0,
    submissions: 0,
  },
};

export const FormMetricsDashboard: React.FC<FormMetricsProps> = ({
  formId,
  refreshInterval = 5000,
  showDetailedMetrics = false,
}) => {
  const [metrics, setMetrics] = useState<MetricsData>(DEFAULT_METRICS);
  const [chart, setChart] = useState<Chart | null>(null);
  const chartRef = React.useRef<HTMLCanvasElement>(null);

  // Initialize performance monitoring
  useEffect(() => {
    const monitor = new FormPerformanceMonitor({
      formId,
      reportThreshold: 0, // Report all metrics
    });

    const updateMetrics = () => {
      const data = monitor.getPerformanceData();
      if (!data) return;

      setMetrics(prevMetrics => {
        const newMetrics = { ...prevMetrics };
        
        // Add new data points
        newMetrics.loadTime.push(data.loadTime);
        newMetrics.interactionDelay.push(data.interactionDelay);
        newMetrics.submissionTime.push(data.submissionTime || 0);
        newMetrics.validationTime.push(data.validationTime || 0);
        newMetrics.networkTime.push(data.networkTime || 0);
        newMetrics.totalTime.push(data.totalTime || 0);
        newMetrics.timestamps.push(new Date().toLocaleTimeString());

        // Keep only last 50 data points
        const maxPoints = 50;
        Object.keys(newMetrics).forEach(key => {
          if (Array.isArray(newMetrics[key as keyof MetricsData])) {
            (newMetrics[key as keyof MetricsData] as any[]) = 
              (newMetrics[key as keyof MetricsData] as any[]).slice(-maxPoints);
          }
        });

        // Update interaction counts
        newMetrics.interactionCounts = data.interactionCounts;

        return newMetrics;
      });
    };

    // Set up periodic updates
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [formId, refreshInterval]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current) return;

    if (chart) {
      chart.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.timestamps,
        datasets: [
          {
            label: 'Load Time',
            data: metrics.loadTime,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
          {
            label: 'Interaction Delay',
            data: metrics.interactionDelay,
            borderColor: 'rgb(255, 205, 86)',
            tension: 0.1,
          },
          {
            label: 'Total Time',
            data: metrics.totalTime,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (ms)',
            },
          },
        },
      },
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [metrics]);

  // Calculate average metrics
  const averages = {
    loadTime: metrics.loadTime.length 
      ? metrics.loadTime.reduce((a, b) => a + b, 0) / metrics.loadTime.length 
      : 0,
    totalTime: metrics.totalTime.length 
      ? metrics.totalTime.reduce((a, b) => a + b, 0) / metrics.totalTime.length 
      : 0,
    errorRate: metrics.interactionCounts.submissions 
      ? Object.values(metrics.interactionCounts.errors).reduce((a, b) => a + b, 0) / metrics.interactionCounts.submissions 
      : 0,
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Form Performance Metrics</h2>
      
      {/* Main Chart */}
      <div className="mb-8">
        <canvas ref={chartRef} />
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-md">
          <h3 className="text-sm font-medium text-muted-foreground">Average Load Time</h3>
          <p className="text-2xl font-bold">{Math.round(averages.loadTime)}ms</p>
        </div>
        <div className="bg-card p-4 rounded-md">
          <h3 className="text-sm font-medium text-muted-foreground">Average Total Time</h3>
          <p className="text-2xl font-bold">{Math.round(averages.totalTime)}ms</p>
        </div>
        <div className="bg-card p-4 rounded-md">
          <h3 className="text-sm font-medium text-muted-foreground">Error Rate</h3>
          <p className="text-2xl font-bold">{(averages.errorRate * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetailedMetrics && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detailed Metrics</h3>
          
          {/* Field Interactions */}
          <div className="bg-card p-4 rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Field Interactions</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics.interactionCounts.fields).map(([field, count]) => (
                <div key={field} className="flex justify-between">
                  <span className="text-sm">{field}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Distribution */}
          <div className="bg-card p-4 rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Error Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics.interactionCounts.errors).map(([field, count]) => (
                <div key={field} className="flex justify-between">
                  <span className="text-sm">{field}</span>
                  <span className="text-sm font-medium text-destructive">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-card p-4 rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-sm">Total Submissions</span>
                <span className="text-sm font-medium">
                  {metrics.interactionCounts.submissions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Validations</span>
                <span className="text-sm font-medium">
                  {metrics.interactionCounts.validations}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormMetricsDashboard;