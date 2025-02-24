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

export default function PreferencesPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    setIsUpdating(true);
    try {
      await updateUser({
        preferences: {
          ...user?.preferences,
          theme,
        },
      });
      toast({
        description: 'Theme preferences updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update theme preferences',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleNotifications = async () => {
    setIsUpdating(true);
    try {
      await updateUser({
        preferences: {
          ...user?.preferences,
          notifications: !user?.preferences?.notifications,
        },
      });
      toast({
        description: 'Notification preferences updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update notification preferences',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Preferences</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Choose your preferred theme for the interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <ButtonWrapper
                variant={user?.preferences?.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClickHandler={() => updateTheme('light')}
              >
                <Icons.sun className="mr-1 h-4 w-4" />
                Light
              </ButtonWrapper>
              <ButtonWrapper
                variant={user?.preferences?.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClickHandler={() => updateTheme('dark')}
              >
                <Icons.moon className="mr-1 h-4 w-4" />
                Dark
              </ButtonWrapper>
              <ButtonWrapper
                variant={user?.preferences?.theme === 'system' ? 'default' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClickHandler={() => updateTheme('system')}
              >
                <Icons.laptop className="mr-1 h-4 w-4" />
                System
              </ButtonWrapper>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage your notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ButtonWrapper
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClickHandler={toggleNotifications}
            >
              <Icons.bell className="mr-1 h-4 w-4" />
              {user?.preferences?.notifications ? 'Disable' : 'Enable'} Notifications
            </ButtonWrapper>
            <p className="text-sm text-muted-foreground">
              {user?.preferences?.notifications
                ? 'You will receive notifications about important updates and activities.'
                : 'You will not receive any notifications.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}