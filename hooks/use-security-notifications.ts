import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import type { SecurityNotification, SecurityEventType } from '@/lib/services/security-notifications';
import { analyzeSecurity } from '@/lib/services/security-notifications';
import type { LoginEvent, SecurityStats } from '@/hooks/use-security-analytics';

interface NotificationPreferences {
  enabled: boolean;
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  types: SecurityEventType[];
  browserNotifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  severityThreshold: 'medium',
  types: ['multiple_failures', 'suspicious_activity', 'new_device', 'new_location'],
  browserNotifications: true,
  soundEnabled: true,
};

export function useSecurityNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`security_prefs_${user.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    }
  }, [user?.id]);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    if (user?.id) {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      localStorage.setItem(`security_prefs_${user.id}`, JSON.stringify(updated));
    }
  }, [preferences, user?.id]);

  // Process new login event
  const processEvent = useCallback((event: LoginEvent, stats: SecurityStats) => {
    if (!user?.id || !preferences.enabled) return;

    const newNotifications = analyzeSecurity(user.id, event, stats)
      .filter(notification => {
        // Filter based on user preferences
        if (severityLevel(notification.severity) < severityLevel(preferences.severityThreshold)) {
          return false;
        }
        return preferences.types.includes(notification.type);
      });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
      setUnreadCount(prev => prev + newNotifications.length);

      // Show browser notification if enabled
      if (preferences.browserNotifications) {
        newNotifications.forEach(notification => {
          showBrowserNotification(notification);
        });
      }

      // Play sound if enabled
      if (preferences.soundEnabled) {
        playNotificationSound();
      }

      // Show toast for high severity notifications
      const highSeverity = newNotifications.find(n => n.severity === 'high' || n.severity === 'critical');
      if (highSeverity) {
        toast({
          title: highSeverity.title,
          description: highSeverity.message,
          variant: 'destructive',
        });
      }
    }
  }, [user?.id, preferences, toast]);

  // Mark notifications as read
  const markAsRead = useCallback((ids?: string[]) => {
    setNotifications(prev => prev.map(notification => {
      if (!ids || ids.includes(notification.id)) {
        return { ...notification, read: true };
      }
      return notification;
    }));
    
    if (!ids) {
      setUnreadCount(0);
    } else {
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    }
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Helper functions
  function severityLevel(severity: SecurityNotification['severity']): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  function showBrowserNotification(notification: SecurityNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Security Alert', {
        body: notification.message,
        icon: '/security-icon.png'
      });
    }
  }

  function playNotificationSound() {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  }

  // Request notification permission if needed
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    processEvent,
    markAsRead,
    clearNotifications,
    updatePreferences,
    requestNotificationPermission,
  };
}

export type UseSecurityNotificationsReturn = ReturnType<typeof useSecurityNotifications>;