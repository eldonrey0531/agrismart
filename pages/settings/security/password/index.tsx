import { Metadata } from 'next';
import { SettingsHeader } from '@/components/settings/settings-header';
import { PasswordChangeForm } from '@/components/settings/security/password-change-form';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Change Password - Security Settings - AgriSmart',
  description: 'Update your account password and security preferences.',
};

/**
 * Password change settings page
 */
export default function PasswordChangePage() {
  return (
    <div className="container max-w-screen-lg py-6 space-y-6">
      <SettingsHeader
        title="Change Password"
        description="Update your password and review security recommendations."
      />
      
      <Card className="p-6">
        <div className="space-y-4 max-w-lg">
          <div>
            <h2 className="text-lg font-medium">Update Password</h2>
            <p className="text-sm text-muted-foreground">
              Choose a strong password that you haven't used before.
            </p>
          </div>
          <Separator />
          <PasswordChangeForm />
        </div>
      </Card>
    </div>
  );
}