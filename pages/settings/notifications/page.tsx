import { Metadata } from 'next';
import { NotificationSettings } from '@/components/security/notification-settings';
import { NotificationTester } from '@/components/security/notification-tester';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notification Settings',
  description: 'Manage your security notification preferences',
};

export default function NotificationsPage() {
  return (
    <div className="container max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
          <p className="text-muted-foreground">
            Configure and test your security notifications
          </p>
        </div>
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        {/* Main notification settings */}
        <NotificationSettings />
        
        {/* Separator with text */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Testing and Preview
            </span>
          </div>
        </div>

        {/* Notification tester */}
        <NotificationTester />
      </div>

      {/* Documentation section */}
      <div className="mt-8 rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-2">About Security Notifications</h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Security notifications help you stay informed about important events 
            related to your account security. You&apos;ll receive alerts for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Failed Login Attempts:</strong> When someone unsuccessfully 
              tries to access your account
            </li>
            <li>
              <strong>New Devices:</strong> When your account is accessed from a 
              new device or browser
            </li>
            <li>
              <strong>Suspicious Activity:</strong> When unusual patterns or 
              potential security risks are detected
            </li>
            <li>
              <strong>Location Changes:</strong> When your account is accessed 
              from a new location
            </li>
          </ul>
          <p>
            You can customize how you receive these notifications using the settings 
            above. We recommend keeping both browser notifications and sound alerts 
            enabled for critical security events.
          </p>
        </div>
      </div>
    </div>
  );
}