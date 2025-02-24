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

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleUpdateProfile = async () => {
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await updateUser({ name });
      toast({
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Icons.user className="h-10 w-10 text-primary" />
              </div>
              <ButtonWrapper
                variant="outline"
                disabled={true}
                onClickHandler={() => {}}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit Photo
              </ButtonWrapper>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end">
              <ButtonWrapper
                disabled={isUpdating || !name.trim() || name === user?.name}
                onClickHandler={handleUpdateProfile}
              >
                {isUpdating ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icons.check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </ButtonWrapper>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Your account information and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Icons.success className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Account created on {new Date(user?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}