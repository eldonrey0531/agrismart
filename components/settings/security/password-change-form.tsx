import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePasswordStrength } from '@/hooks/use-password-security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrength, PasswordStrengthSummary } from '@/components/security/password-strength';

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * Password change form with strength indicator
 */
export function PasswordChangeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { recommendations, strength } = usePasswordStrength();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      await api.auth.changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully. Please log in again.',
        variant: 'default',
      });

      // Clear form
      form.reset();

      // Redirect after short delay
      setTimeout(() => {
        router.push('/settings/security');
      }, 2000);

    } catch (error: any) {
      toast({
        title: 'Password Update Failed',
        description: error.message || 'Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const watchNewPassword = form.watch('newPassword');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword.current ? "text" : "password"}
                    placeholder="Enter your current password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPassword.current ? "Hide" : "Show"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Choose a strong password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPassword.new ? "Hide" : "Show"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              
              {/* Password Strength Indicator */}
              {watchNewPassword && (
                <div className="mt-2">
                  <PasswordStrength strength={strength} />
                </div>
              )}

              {/* Password Requirements */}
              {recommendations.length > 0 && (
                <Alert variant="warning" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPassword.confirm ? "Hide" : "Show"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Strength Summary */}
        {watchNewPassword && (
          <PasswordStrengthSummary strength={strength} />
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/settings/security')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || strength === 'weak'}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}