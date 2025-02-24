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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match',
      });
      return;
    }

    setIsUpdating(true);
    // TODO: Implement password change functionality
    toast({
      variant: 'destructive',
      title: 'Not Implemented',
      description: 'Password change functionality is not yet implemented',
    });
    setIsUpdating(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Security</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end">
                <ButtonWrapper
                  type="submit"
                  disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icons.check className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </ButtonWrapper>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>
              Overview of your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Icons.success className="h-4 w-4 text-green-500" />
              <span className="text-sm">Two-factor authentication not available yet</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.success className="h-4 w-4 text-green-500" />
              <span className="text-sm">Last password change: Never</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}