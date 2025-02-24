'use client';

import { useState } from 'react';
import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { LocationAnalysis, DeviceAnalysis, LoginTrends } from './security-analysis';
import { ExportReport } from './export-report';
import type { SecurityStats, LoginEvent } from '@/hooks/use-security-analytics';

// Period options for the analytics
const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export function SecurityDashboard() {
  const [period, setPeriod] = useState('30');
  const { loading, stats, events, refresh } = useSecurityAnalytics(Number(period));

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Security Overview</h2>
          <p className="text-sm text-muted-foreground">
            Monitor login activity and security events
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportReport 
            stats={stats}
            events={events}
            period={period}
          />
          <Button variant="outline" size="icon" onClick={refresh} title="Refresh data">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Logins"
          value={stats.totalLogins}
          description="Total login attempts"
          icon={Shield}
        />
        <MetricCard
          title="Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          description="Successful login rate"
          trend={stats.successRate >= 95 ? 'positive' : 'negative'}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Unique Devices"
          value={stats.uniqueDevices}
          description="Different devices used"
          icon={Shield}
        />
        <MetricCard
          title="Failed Attempts"
          value={stats.failedAttempts}
          description="Failed login attempts"
          trend={stats.failedAttempts === 0 ? 'positive' : 'negative'}
          icon={AlertTriangle}
        />
      </div>

      {/* Latest Failed Attempt Alert */}
      {stats.lastFailedAttempt && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recent Failed Login Attempt</AlertTitle>
          <AlertDescription>
            Last failed attempt was from {stats.lastFailedAttempt.location || 'unknown location'} using{' '}
            {stats.lastFailedAttempt.device || 'unknown device'} -{' '}
            {formatDistanceToNow(new Date(stats.lastFailedAttempt.timestamp))} ago
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <ActivityLog events={stats.recentEvents} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationAnalysis locations={stats.topLocations} />
        </TabsContent>

        <TabsContent value="devices">
          <DeviceAnalysis devices={stats.topDevices} />
        </TabsContent>

        <TabsContent value="trends">
          <LoginTrends trends={stats.loginTrends} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for individual metric cards
interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: 'positive' | 'negative';
  icon: React.ElementType;
}

function MetricCard({ title, value, description, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          trend === 'positive' ? 'text-green-500' : 
          trend === 'negative' ? 'text-red-500' : 
          'text-muted-foreground'
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Recent activity log component
function ActivityLog({ events }: { events: LoginEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest login attempts and security events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {events.map(event => (
              <div
                key={event.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                {event.status === 'success' ? (
                  <CheckCircle2 className="mt-1 h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="mt-1 h-4 w-4 text-red-500" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {event.status === 'success' ? 'Successful login' : 'Failed login attempt'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>{format(new Date(event.timestamp), 'PPpp')}</p>
                    <p>Location: {event.location || 'Unknown'}</p>
                    <p>Device: {event.device || 'Unknown'}</p>
                    {event.reason && <p>Reason: {event.reason}</p>}
                  </div>
                </div>
                <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}