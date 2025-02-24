'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface UseNotificationsOptions {
  limit?: number;
  pollingInterval?: number;
  showToasts?: boolean;
}

export function useNotifications({
  limit = 10,
  pollingInterval = 30000, // 30 seconds
  showToasts = true,
}: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Mock fetch notifications (replace with real API call)
  const fetchNotifications = useCallback(async () => {
    try {
      // Simulate API call
      const response = await new Promise<Notification[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              type: 'warning',
              title: 'Weather Alert',
              message: 'Heavy rain expected in the next 24 hours',
              timestamp: new Date().toISOString(),
              read: false,
            },
            {
              id: '2',
              type: 'success',
              title: 'Task Completed',
              message: 'Field irrigation maintenance completed',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              read: false,
            },
            // Add more mock notifications as needed
          ]);
        }, 500);
      });

      setNotifications(response.slice(0, limit));
      const unread = response.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Show toast for new notifications
      if (showToasts && unread > 0) {
        toast({
          title: `${unread} New Notification${unread > 1 ? 's' : ''}`,
          description: 'Click to view your notifications',
        });
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, showToasts, toast]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();

    if (pollingInterval > 0) {
      const intervalId = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications, pollingInterval]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Clear notification
  const clearNotification = useCallback(async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => 
        notifications.find(n => n.id === id && !n.read)
          ? Math.max(0, prev - 1)
          : prev
      );
    } catch (err) {
      console.error('Failed to clear notification:', err);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refresh: fetchNotifications,
  };
}

/**
 * Usage Example:
 * 
 * const {
 *   notifications,
 *   unreadCount,
 *   isLoading,
 *   markAsRead,
 *   markAllAsRead,
 * } = useNotifications({
 *   limit: 5,
 *   pollingInterval: 60000,
 *   showToasts: true,
 * });
 */