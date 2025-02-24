'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/lib/mock/dashboard-data';

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons = {
  task: Icons.check,
  alert: Icons.warning,
  update: Icons.refresh,
  milestone: Icons.star,
};

const priorityClasses = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function ActivityIcon({ type }: { type: keyof typeof activityIcons }) {
  const Icon = activityIcons[type];
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.floor((date.getTime() - Date.now()) / (1000 * 60)), // convert to minutes
    'minute'
  );
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4"
            >
              <ActivityIcon type={activity.type} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.priority && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      priorityClasses[activity.priority]
                    )}>
                      {activity.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(activity.timestamp)}
                </p>
                {activity.status && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Example:
 * 
 * import { recentActivity } from '@/lib/mock/dashboard-data';
 * 
 * <RecentActivity
 *   activities={recentActivity}
 *   className="col-span-1"
 * />
 */