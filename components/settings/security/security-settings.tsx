import { useState } from 'react';
import { Shield, Lock, Smartphone, Bell, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { usePasswordStrength } from '@/hooks/use-password-security';
import { PasswordStatus } from '@/components/security/password-status';

/**
 * Security settings page content
 */
export function SecuritySettings() {
  const { user } = useAuth();
  const { strength, recommendations } = usePasswordStrength();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Password Security</h3>
            <p className="text-sm text-muted-foreground">
              Manage your password and login security preferences.
            </p>
          </div>
          <PasswordStatus showNotifications={false} />
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Change Password</div>
              <div className="text-xs text-muted-foreground">
                {recommendations[0] || 'Update your password regularly for better security.'}
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/settings/security/password">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Enable 2FA</div>
              <div className="text-xs text-muted-foreground">
                Secure your account with two-factor authentication.
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/settings/security/2fa">
                <Smartphone className="mr-2 h-4 w-4" />
                Setup 2FA
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Security Notifications */}
      <Card className="p-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Security Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Manage your security alert preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <NotificationSetting
            title="New login alerts"
            description="Get notified when someone logs in from a new device."
            defaultEnabled={true}
          />
          <NotificationSetting
            title="Password change alerts"
            description="Get notified when your password is changed."
            defaultEnabled={true}
          />
          <NotificationSetting
            title="Two-factor alerts"
            description="Get notified of two-factor authentication changes."
            defaultEnabled={true}
          />
        </div>
      </Card>

      {/* Security Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Security Activity</h3>
            <p className="text-sm text-muted-foreground">
              View your recent security-related activity.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/settings/security/activity">
              <Activity className="mr-2 h-4 w-4" />
              View Activity
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface NotificationSettingProps {
  title: string;
  description: string;
  defaultEnabled?: boolean;
}

/**
 * Notification toggle setting
 */
function NotificationSetting({
  title,
  description,
  defaultEnabled = false
}: NotificationSettingProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label={`Toggle ${title.toLowerCase()}`}
      />
    </div>
  );
}