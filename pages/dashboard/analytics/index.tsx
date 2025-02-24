'use client';

import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { cn } from '@/lib/utils';

const mockMetrics = [
  {
    title: 'Total Yield',
    value: '2,845 kg',
    change: '+12.5%',
    trend: 'up',
    icon: Icons.barChart,
  },
  {
    title: 'Active Fields',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Icons.sprout,
  },
  {
    title: 'Crop Types',
    value: '6',
    change: '0',
    trend: 'neutral',
    icon: Icons.chart,
  },
  {
    title: 'Efficiency Score',
    value: '94%',
    change: '+5%',
    trend: 'up',
    icon: Icons.star,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <ButtonWrapper variant="outline">
          <Icons.download className="mr-2 h-4 w-4" />
          Download Report
        </ButtonWrapper>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={cn(
                  "text-xs",
                  metric.trend === 'up' && "text-green-600 dark:text-green-400",
                  metric.trend === 'down' && "text-red-600 dark:text-red-400",
                  metric.trend === 'neutral' && "text-muted-foreground"
                )}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yield Overview</CardTitle>
            <CardDescription>
              Monthly yield comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Icons.barChart className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Performance</CardTitle>
            <CardDescription>
              Performance metrics by field
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Icons.chart className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Field metrics visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather Impact</CardTitle>
            <CardDescription>
              Weather patterns and crop yield correlation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-sm text-muted-foreground">
                Weather impact analysis will be available soon
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>
              Resource efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-sm text-muted-foreground">
                Resource utilization metrics will be available soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}