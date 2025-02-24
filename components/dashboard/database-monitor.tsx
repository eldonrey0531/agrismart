"use client";

import { useEffect, useState } from "react";
import { dbMonitor, type PerformanceMetrics, type PerformanceAlert } from "@/lib/utils/db-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, AlertTriangle, Info, Activity, Database, Clock } from "lucide-react";

interface MetricsChartData {
  timestamp: string;
  queryCount: number;
  avgLatency: number;
  errors: number;
}

export function DatabaseMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [summary, setSummary] = useState(dbMonitor.getPerformanceSummary());
  const [latestMetrics, setLatestMetrics] = useState(dbMonitor.getLatestMetrics());

  useEffect(() => {
    // Initial data
    setMetrics(dbMonitor.getMetrics(50));
    setAlerts(dbMonitor.getAlerts(10));

    // Subscribe to updates
    const onMetrics = (newMetrics: PerformanceMetrics) => {
      setMetrics(current => [newMetrics, ...current].slice(0, 50));
      setLatestMetrics(newMetrics);
      setSummary(dbMonitor.getPerformanceSummary());
    };

    const onAlert = (alert: PerformanceAlert) => {
      setAlerts(current => [alert, ...current].slice(0, 10));
    };

    dbMonitor.on("metrics", onMetrics);
    dbMonitor.on("alert", onAlert);

    return () => {
      dbMonitor.removeListener("metrics", onMetrics);
      dbMonitor.removeListener("alert", onAlert);
    };
  }, []);

  const chartData: MetricsChartData[] = metrics.map(m => ({
    timestamp: m.timestamp.toISOString(),
    queryCount: m.queryCount,
    avgLatency: Math.round(m.averageLatency),
    errors: m.errors,
  })).reverse();

  const getAlertIcon = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      default: return <Info className="h-5 w-5 text-info" />;
    }
  };

  return (
    <div className="grid gap-4">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Queries</div>
              <div className="text-2xl font-bold">
                {latestMetrics?.queryCount ?? 0}
              </div>
              <Progress 
                value={latestMetrics ? (latestMetrics.errors / latestMetrics.queryCount) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Average Latency</div>
              <div className="text-2xl font-bold">
                {latestMetrics ? `${Math.round(latestMetrics.averageLatency)}ms` : 'N/A'}
              </div>
              <Progress 
                value={latestMetrics ? (latestMetrics.averageLatency / 1000) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Connections</div>
              <div className="text-2xl font-bold">
                {latestMetrics?.totalConnections ?? 0}
              </div>
              <Progress 
                value={latestMetrics ? (latestMetrics.totalConnections / 10) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [value, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="queryCount" 
                  stroke="#2563eb" 
                  name="Queries"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgLatency" 
                  stroke="#dc2626" 
                  name="Latency (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#ea580c" 
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <AlertTitle>{alert.message}</AlertTitle>
                      <AlertDescription className="text-xs">
                        {alert.timestamp.toLocaleString()}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
              {alerts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent alerts
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default DatabaseMonitor;