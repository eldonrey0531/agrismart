'use client';

import { useAuth } from '@/contexts/auth-context';
import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSetting {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    key: 'system',
    title: 'System Notifications',
    description: 'Receive notifications about system updates and maintenance',
    enabled: true,
  },
  {
    key: 'activity',
    title: 'Activity Notifications',
    description: 'Get notified about important activities in your account',
    enabled: true,
  },
  {
    key: 'marketing',
    title: 'Marketing Updates',
    description: 'Receive updates about new features and promotions',
    enabled: false,
  },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);

  const toggleNotification = async (key: string) => {
    setIsUpdating(true);
    try {
      const newSettings = settings.map((setting) =>
        setting.key === key
          ? { ...setting, enabled: !setting.enabled }
          : setting
      );
      setSettings(newSettings);
      
      // TODO: Implement API call to update notification settings
      toast({
        description: 'Notification settings updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update notification settings',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{setting.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <ButtonWrapper
                  variant={setting.enabled ? 'default' : 'outline'}
                  size="sm"
                  disabled={isUpdating}
                  onClickHandler={() => toggleNotification(setting.key)}
                >
                  {setting.enabled ? (
                    <>
                      <Icons.check className="mr-1 h-4 w-4" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <Icons.close className="mr-1 h-4 w-4" />
                      Disabled
                    </>
                  )}
                </ButtonWrapper>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Frequency</CardTitle>
            <CardDescription>
              Control how often you receive email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icons.info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Email frequency settings will be available soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}