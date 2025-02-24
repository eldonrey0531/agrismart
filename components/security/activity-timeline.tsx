'use client';

import { format } from 'date-fns';
import { Icons } from '@/components/ui/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';

interface TimelineEvent {
  id: string;
  type: 'login' | 'password_change' | 'role_change' | 'security_update' | 'permission_change';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface TimelineItemProps {
  event: TimelineEvent;
}

function TimelineItem({ event }: TimelineItemProps) {
  const icons = {
    login: Icons.login,
    password_change: Icons.security,
    role_change: Icons.users,
    security_update: Icons.shield,
    permission_change: Icons.admin,
  };

  const statusColors = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const Icon = icons[event.type];

  return (
    <div className="flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="relative flex h-full w-6 items-center justify-center">
        <div className="absolute h-full w-px bg-border" />
        <div className={cn(
          'relative z-10 h-6 w-6 rounded-full border bg-background',
          statusColors[event.status]
        )}>
          <Icon className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{event.title}</h4>
          <time className="text-sm text-muted-foreground">
            {format(event.timestamp, 'MMM d, yyyy HH:mm')}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">
          {event.description}
        </p>
        {/* Additional details for admins */}
        {event.userRole === 'admin' && (
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {event.ipAddress && (
              <p>IP Address: {event.ipAddress}</p>
            )}
            {event.userAgent && (
              <p>User Agent: {event.userAgent}</p>
            )}
            {event.metadata && Object.entries(event.metadata).map(([key, value]) => (
              <p key={key}>{key}: {value}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  maxHeight?: number;
  className?: string;
}

export function ActivityTimeline({
  events,
  maxHeight = 400,
  className,
}: ActivityTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  if (!events.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center">
        <Icons.info className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No activity to display
        </p>
      </div>
    );
  }

  return (
    <ScrollArea
      className={cn('relative rounded-md border p-4', className)}
      style={{ maxHeight }}
    >
      <div className="space-y-8">
        {sortedEvents.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </ScrollArea>
  );
}

export default ActivityTimeline;