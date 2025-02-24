'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone } from 'lucide-react';

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  mobileNumber: z
    .string()
    .regex(/^\+?63[0-9]{10}$/, {
      message: 'Please enter a valid Philippine mobile number (+63XXXXXXXXXX)',
    })
    .optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
    },
  });

  async function onSubmit(data: AccountFormValues) {
    try {
      // TODO: Implement account update logic
      toast({
        title: 'Account updated',
        description: 'Your account settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update account settings. Please try again.',
      });
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Please sign in to view your account settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Email cannot be changed. Contact support for assistance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+63XXXXXXXXXX" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your Philippine mobile number starting with +63
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">
                Your email has been verified
              </p>
            </div>
            <div className="flex h-6 items-center">
              {user.emailVerified ? (
                <span className="text-sm text-success">Verified</span>
              ) : (
                <Button variant="ghost" size="sm">
                  Verify Email
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">
                {user.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}