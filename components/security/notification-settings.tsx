'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityNotifications } from '@/hooks/use-security-notifications';
import { Bell, Volume2, ShieldAlert, BellOff } from 'lucide-react';
import type { SecurityEventType } from '@/lib/services/security-notifications';

const NOTIFICATION_TYPES: Array<{
  id: SecurityEventType;
  label: string;
  description: string;
}> = [
  {
    id: 'failed_login',
    label: 'Failed Login Attempts',
    description: 'Notify when login attempts fail',
  },
  {
    id: 'suspicious_activity',
    label: 'Suspicious Activity',
    description: 'Notify of potentially malicious behavior',
  },
  {
    id: 'new_device',
    label: 'New Device Login',
    description: 'Notify when logging in from a new device',
  },
  {
    id: 'new_location',
    label: 'New Location Login',
    description: 'Notify when logging in from a new location',
  },
  {
    id: 'multiple_failures',
    label: 'Multiple Failures',
    description: 'Notify of repeated login failures',
  },
  {
    id: 'account_locked',
    label: 'Account Locked',
    description: 'Notify when account is locked for security',
  },
  {
    id: 'password_expired',
    label: 'Password Expiration',
    description: 'Notify when password needs renewal',
  },
  {
    id: 'session_expired',
    label: 'Session Expiration',
    description: 'Notify before session expires',
  },
];

export function NotificationSettings() {
  const { preferences, updatePreferences, requestNotificationPermission } = useSecurityNotifications();
  const { toast } = useToast();
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(
    typeof window !== 'undefined' ? Notification.permission : null
  );

  const handleBrowserNotificationsChange = async (enabled: boolean) => {
    if (enabled && browserPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setBrowserPermission(permission ? 'granted' : 'denied');
      
      if (!permission) {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
        return;
      }
    }
    updatePreferences({ browserNotifications: enabled });
  };

  const handleTypeToggle = (type: SecurityEventType, checked: boolean) => {
    const updatedTypes = checked
      ? [...preferences.types, type]
      : preferences.types.filter(t => t !== type);
    
    updatePreferences({ types: updatedTypes });
  };

  const handleSeverityChange = (value: string) => {
    updatePreferences({
      severityThreshold: value as 'low' | 'medium' | 'high' | 'critical'
    });
  };

  const resetDefaults = () => {
    updatePreferences({
      enabled: true,
      severityThreshold: 'medium',
      types: ['multiple_failures', 'suspicious_activity', 'new_device', 'new_location'],
      browserNotifications: false,
      soundEnabled: true,
    });
    
    toast({
      title: 'Settings Reset',
      description: 'Notification settings have been reset to defaults',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Security Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be notified about security events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Security Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts about important security events
            </p>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked: boolean) => updatePreferences({ enabled: checked })}
          />
        </div>

        {preferences.enabled && (
          <>
            {/* Severity threshold */}
            <div className="space-y-2">
              <Label>Minimum Severity Level</Label>
              <Select
                value={preferences.severityThreshold}
                onValueChange={handleSeverityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - All Notifications</SelectItem>
                  <SelectItem value="medium">Medium - Important and Above</SelectItem>
                  <SelectItem value="high">High - Critical Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification types */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="types">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Event Types
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {NOTIFICATION_TYPES.map((type) => (
                      <div key={type.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={preferences.types.includes(type.id)}
                          onCheckedChange={(checked: boolean) => 
                            handleTypeToggle(type.id, checked)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={type.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type.label}
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Delivery methods */}
            <div className="space-y-4">
              <Label>Delivery Methods</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellOff className="h-4 w-4" />
                    <div className="space-y-1">
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.browserNotifications}
                    onCheckedChange={handleBrowserNotificationsChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <div className="space-y-1">
                      <Label>Sound Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound for important alerts
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked: boolean) => 
                      updatePreferences({ soundEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Reset button */}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={resetDefaults}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}