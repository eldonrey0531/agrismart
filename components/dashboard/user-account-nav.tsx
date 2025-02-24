'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationsContext } from '@/contexts/notifications-context';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/dashboard/user-nav';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'success':
      return <Icons.success className="h-4 w-4 text-success" />;
    case 'warning':
      return <Icons.warning className="h-4 w-4 text-warning" />;
    case 'error':
      return <Icons.error className="h-4 w-4 text-destructive" />;
    default:
      return <Icons.info className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function UserAccountNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotificationsContext();

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        {/* Notifications */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Icons.bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs font-normal"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex items-start gap-2 p-3"
                    onSelect={() => {
                      if (!notification.read) markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <NotificationIcon type={notification.type} />
                    <div className="flex flex-col gap-1">
                      <p className={cn(
                        "text-sm font-medium",
                        !notification.read && "text-primary"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.timestamp)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-3 text-center">
                  <Link href="/notifications">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/dashboard/settings">
            <Icons.settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* User Menu */}
      <UserNav />
    </div>
  );
}