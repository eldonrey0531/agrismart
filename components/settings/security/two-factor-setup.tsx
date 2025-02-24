import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Smartphone, QrCode, Copy, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const verificationSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
});

type VerificationData = z.infer<typeof verificationSchema>;

interface SetupData {
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}

type SetupStep = 'init' | 'setup' | 'verify' | 'complete';

/**
 * Two-factor authentication setup component
 */
export function TwoFactorSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [step, setStep] = useState<SetupStep>('init');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const form = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  // Start 2FA setup
  const startSetup = async () => {
    try {
      setLoading(true);
      const data = await api.security.enable2FA();
      setSetupData(data);
      setStep('setup');
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to start 2FA setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify and complete setup
  const onSubmit = async (data: VerificationData) => {
    try {
      setLoading(true);
      await api.security.verify2FA(data.code);
      setStep('complete');
      
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account.',
      });

      // Redirect after delay
      setTimeout(() => {
        router.push('/settings/security');
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy recovery codes to clipboard
  const copyRecoveryCodes = () => {
    if (!setupData?.recoveryCodes) return;
    navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
    setCopiedCodes(true);
    toast({
      title: 'Recovery Codes Copied',
      description: 'Store these codes in a secure location.',
    });
  };

  return (
    <div className="space-y-6">
      {step === 'init' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Enable Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account by requiring a verification code when you sign in.
            </p>
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              You'll need an authenticator app like Google Authenticator or Authy to complete this setup.
            </AlertDescription>
          </Alert>

          <Button onClick={startSetup} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Setup...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Start Setup
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Scan QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, or enter the code manually.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <Image
                src={setupData.qrCode}
                alt="QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Manual Entry Code</p>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-muted rounded text-sm">
                {setupData.secret}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(setupData.secret);
                  toast({
                    description: 'Code copied to clipboard',
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={() => setStep('verify')}>Continue</Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Verify Setup</h2>
            <p className="text-sm text-muted-foreground">
              Enter the verification code from your authenticator app to complete setup.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('setup')}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and Enable'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {step === 'complete' && setupData && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <h2 className="text-lg font-medium">Setup Complete</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save these recovery codes in a secure location. You'll need them if you lose access to your authenticator app.
            </p>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              {setupData.recoveryCodes.map((code, index) => (
                <code key={index} className="block font-mono text-sm">
                  {code}
                </code>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={copyRecoveryCodes}
              disabled={copiedCodes}
            >
              {copiedCodes ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Codes Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Recovery Codes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}