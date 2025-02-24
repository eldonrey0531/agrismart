'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Password strength checker
function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.match(/[A-Z]/)) strength += 20;
  if (password.match(/[a-z]/)) strength += 20;
  if (password.match(/[0-9]/)) strength += 20;
  if (password.match(/[^A-Za-z0-9]/)) strength += 20;
  return strength;
}

// Get color for password strength indicator
function getStrengthColor(strength: number): string {
  if (strength <= 20) return 'bg-destructive';
  if (strength <= 40) return 'bg-orange-500';
  if (strength <= 60) return 'bg-yellow-500';
  if (strength <= 80) return 'bg-blue-500';
  return 'bg-green-500';
}

// Get message for password strength
function getStrengthMessage(strength: number): string {
  if (strength <= 20) return 'Very Weak';
  if (strength <= 40) return 'Weak';
  if (strength <= 60) return 'Fair';
  if (strength <= 80) return 'Good';
  return 'Strong';
}

export default function PasswordSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    try {
      setIsChanging(true);
      
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  }

  // Handle password strength check
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength(getPasswordStrength(password));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Password Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your password and manage password security settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Choose a strong password to protect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkPasswordStrength(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      <div className="space-y-2">
                        <Progress
                          value={passwordStrength}
                          className={getStrengthColor(passwordStrength)}
                        />
                        <p className="text-sm">
                          Password Strength: {getStrengthMessage(passwordStrength)}
                        </p>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isChanging}>
                {isChanging ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Security Info */}
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Password Requirements</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>At least 8 characters long</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Last Password Change */}
      {user?.lastPasswordReset && (
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Last Password Change</AlertTitle>
          <AlertDescription>
            Your password was last changed on{' '}
            {new Date(user.lastPasswordReset).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}