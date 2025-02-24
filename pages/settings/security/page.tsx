'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Loading, TableLoading } from '@/components/ui/loading';
import { ProtectedPage } from '@/components/layout/protected-page';
import { ActivityTimeline } from '@/components/security/activity-timeline';
import { usePasswordSecurity } from '@/hooks/use-password-security';
import { useSecurityEvents } from '@/hooks/use-security-events';
import { useAuth } from '@/contexts/auth-context';

/**
 * Security Settings Page
 */
export default function SecuritySettingsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { isLoading: isLoadingPassword, error: passwordError } = usePasswordSecurity();
  const {
    events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch,
  } = useSecurityEvents({
    limit: 10,
  });

  // Handle errors
  if (passwordError || eventsError) {
    return (
      <ProtectedPage
        allowedRoles={['buyer', 'seller', 'admin']}
        header={{
          heading: 'Security Settings',
          text: 'Manage your account security and preferences.',
        }}
      >
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
          <Icons.alert className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error Loading Security Settings</h2>
            <p className="text-muted-foreground">
              {passwordError?.message || eventsError?.message || 'An error occurred'}
            </p>
          </div>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage
      allowedRoles={['buyer', 'seller', 'admin']}
      header={{
        heading: 'Security Settings',
        text: 'Manage your account security and preferences.',
        children: (
          <Button
            onClick={() => router.push('/settings/security/password')}
            className="gap-2"
          >
            <Icons.security className="h-4 w-4" />
            Change Password
          </Button>
        ),
      }}
    >
      <div className="grid gap-8">
        {/* Password Security Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Password Security</h3>
              <p className="text-sm text-muted-foreground">
                Manage your password and two-factor authentication settings.
              </p>
            </div>
            {isLoadingPassword ? (
              <Loading size="sm" />
            ) : (
              <div className="flex items-center gap-2">
                <Icons.check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Password up to date
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Two Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Icons.security className="h-4 w-4" />
              Enable 2FA
            </Button>
          </div>
        </div>

        {/* Security Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Security Activity</h3>
              <p className="text-sm text-muted-foreground">
                Review your recent security events and login activity.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => refetch()}
              disabled={isLoadingEvents}
              className="gap-2"
            >
              <Icons.refresh className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <Suspense fallback={<TableLoading rows={5} />}>
            <ActivityTimeline
              events={events}
              maxHeight={400}
              className="mt-4"
            />
          </Suspense>
        </div>

        {/* Additional Security Controls for Admins */}
        {role === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Security Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced security settings and system-wide controls.
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Icons.admin className="h-4 w-4" />
                Security Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}