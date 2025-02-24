'use client';

import { useEffect } from 'react';
import { BellRing, Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSecurityNotifications } from '@/hooks/use-security-notifications';
import { formatDistanceToNow } from 'date-fns';
import type { SecurityNotification } from '@/lib/services/security-notifications';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    requestNotificationPermission,
  } = useSecurityNotifications();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Auto mark as read when popover opens
  const handlePopoverOpen = (open: boolean) => {
    if (open && unreadCount > 0) {
      markAsRead();
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Security notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <BellRing className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Security Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-auto px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Shield className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification }: { notification: SecurityNotification }) {
  // Get icon based on notification type and severity
  const getIcon = () => {
    if (notification.severity === 'critical' || notification.severity === 'high') {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (notification.type === 'suspicious_activity') {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  // Get style classes based on severity
  const getSeverityClasses = () => {
    switch (notification.severity) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/20';
      case 'high':
        return 'bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-muted/40 border-muted';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${getSeverityClasses()}`}
    >
      <div className="mt-1">{getIcon()}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.timestamp))} ago
        </p>
      </div>
    </div>
  );
}