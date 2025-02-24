import { Metadata } from 'next';
import { SettingsHeader } from '@/components/settings/settings-header';
import { TwoFactorSetup } from '@/components/settings/security/two-factor-setup';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Two-Factor Authentication - Security Settings - AgriSmart',
  description: 'Set up two-factor authentication to secure your account.',
};

/**
 * Two-factor authentication setup page
 */
export default function TwoFactorPage() {
  return (
    <div className="container max-w-screen-lg py-6 space-y-6">
      <SettingsHeader
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account by requiring a second form of authentication."
      />

      <Card className="p-6">
        <div className="max-w-2xl">
          <TwoFactorSetup />
        </div>
      </Card>
    </div>
  );
}