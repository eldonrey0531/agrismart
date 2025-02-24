'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSecurityNotifications } from '@/hooks/use-security-notifications';
import { useToast } from '@/components/ui/use-toast';
import { PlayCircle, BellRing, Volume2 } from 'lucide-react';
import type { SecurityEventType, SecurityNotification } from '@/lib/services/security-notifications';

interface TestNotification extends SecurityNotification {
  title: string;
  message: string;
}

const TEST_NOTIFICATIONS: Record<SecurityEventType, TestNotification> = {
  failed_login: {
    id: 'test-failed-login',
    type: 'failed_login',
    title: 'Failed Login Attempt',
    message: 'A login attempt failed from New York, USA using Chrome on Windows',
    severity: 'medium',
    timestamp: new Date().toISOString(),
    metadata: {
      location: 'New York, USA',
      device: 'Chrome on Windows',
      ipAddress: '192.168.1.1'
    }
  },
  suspicious_activity: {
    id: 'test-suspicious',
    type: 'suspicious_activity',
    title: 'Suspicious Activity Detected',
    message: 'Multiple login attempts from different locations',
    severity: 'high',
    timestamp: new Date().toISOString(),
    metadata: {
      locations: ['London, UK', 'Tokyo, Japan', 'Sydney, Australia'],
      timespan: '1 hour'
    }
  },
  new_device: {
    id: 'test-new-device',
    type: 'new_device',
    title: 'New Device Login',
    message: 'New login from iPhone 13 in San Francisco',
    severity: 'medium',
    timestamp: new Date().toISOString(),
    metadata: {
      device: 'iPhone 13',
      location: 'San Francisco, US',
      browser: 'Safari Mobile'
    }
  },
  new_location: {
    id: 'test-new-location',
    type: 'new_location',
    title: 'New Login Location',
    message: 'First login detected from Paris, France',
    severity: 'medium',
    timestamp: new Date().toISOString(),
    metadata: {
      location: 'Paris, France',
      device: 'Firefox on MacOS'
    }
  },
  multiple_failures: {
    id: 'test-multiple-failures',
    type: 'multiple_failures',
    title: 'Multiple Failed Login Attempts',
    message: '5 failed login attempts in the last 10 minutes',
    severity: 'high',
    timestamp: new Date().toISOString(),
    metadata: {
      attempts: 5,
      timespan: '10 minutes'
    }
  },
  account_locked: {
    id: 'test-account-locked',
    type: 'account_locked',
    title: 'Account Temporarily Locked',
    message: 'Account locked due to multiple failed login attempts',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    metadata: {
      duration: '30 minutes',
      reason: 'Multiple failed attempts'
    }
  },
  password_expired: {
    id: 'test-password-expired',
    type: 'password_expired',
    title: 'Password Expiring Soon',
    message: 'Your password will expire in 3 days',
    severity: 'low',
    timestamp: new Date().toISOString(),
    metadata: {
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  session_expired: {
    id: 'test-session-expired',
    type: 'session_expired',
    title: 'Session Expiring Soon',
    message: 'Your session will expire in 5 minutes',
    severity: 'low',
    timestamp: new Date().toISOString(),
    metadata: {
      expiryTime: '5 minutes'
    }
  }
};

export function NotificationTester() {
  const [selectedType, setSelectedType] = useState<SecurityEventType>('new_device');
  const { preferences } = useSecurityNotifications();
  const { toast } = useToast();
  const [testingSound, setTestingSound] = useState(false);

  const handleTypeChange = (value: string) => {
    if (isSecurityEventType(value)) {
      setSelectedType(value);
    }
  };

  // Type guard for SecurityEventType
  const isSecurityEventType = (value: string): value is SecurityEventType => {
    return value in TEST_NOTIFICATIONS;
  };

  const testNotification = async () => {
    const notification = TEST_NOTIFICATIONS[selectedType];

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.severity === 'critical' || notification.severity === 'high' 
        ? 'destructive' 
        : 'default'
    });

    // Show browser notification if enabled
    if (preferences.browserNotifications && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/security-icon.png'
      });
    }

    // Play sound if enabled
    if (preferences.soundEnabled) {
      setTestingSound(true);
      const audio = new Audio('/sounds/notification.mp3');
      try {
        await audio.play();
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      } finally {
        setTestingSound(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Test Notifications
        </CardTitle>
        <CardDescription>
          Preview how different security notifications will appear
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TEST_NOTIFICATIONS).map(([type, notification]) => (
                <SelectItem key={type} value={type}>
                  {notification.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Selected notification will appear as:
          </div>
          
          <div className="rounded-md border p-4">
            <div className="font-medium">{TEST_NOTIFICATIONS[selectedType].title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {TEST_NOTIFICATIONS[selectedType].message}
            </div>
          </div>

          <div className="flex items-start gap-4 text-sm text-muted-foreground">
            {preferences.browserNotifications && (
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Browser notification
              </div>
            )}
            {preferences.soundEnabled && (
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound alert
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={testNotification} 
          disabled={testingSound}
          className="w-full"
        >
          Test Notification
        </Button>
      </CardContent>
    </Card>
  );
}