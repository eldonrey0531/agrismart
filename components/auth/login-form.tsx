'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Pre-fill test account if enabled
  const defaultValues = {
    email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL || '',
    password: process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD || '',
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Check test credentials
      if (
        data.email === process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL &&
        data.password === process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD
      ) {
        // Use window.location.replace for a full page navigation
        window.location.replace('/test-page');
        return;
      }
      
      alert('Please use test credentials');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        {process.env.NEXT_PUBLIC_ENABLE_TEST_ACCOUNT === 'true' && (
          <Alert className="bg-gradient-to-r from-[#244A32]/30 to-[#172F21]/30 border-[#38FF7E]/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Icons.info className="h-4 w-4 text-[#38FF7E]" />
              <AlertDescription className="text-[#E3FFED]/90">
                Test account enabled. Use:
                <br />
                Email: <span className="text-[#38FF7E]">{defaultValues.email}</span>
                <br />
                Password: <span className="text-[#38FF7E]">{defaultValues.password}</span>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#E3FFED]/70">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#244A32]/20 to-[#172F21]/20 border-[#38FF7E]/10 focus:border-[#38FF7E]/30 placeholder:text-[#E3FFED]/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#E3FFED]/70">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#244A32]/20 to-[#172F21]/20 border-[#38FF7E]/10 focus:border-[#38FF7E]/30 placeholder:text-[#E3FFED]/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={`w-full premium-button relative overflow-hidden transition-all duration-300
              ${isLoading ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02]'}
              bg-gradient-to-r from-[#244A32] via-[#172F21] to-[#244A32] border border-[#38FF7E]/20
            `}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#38FF7E]/20 to-transparent animate-pulse" />
                  <Icons.spinner className="h-4 w-4 animate-spin text-[#38FF7E]" />
                </div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#38FF7E]/0 via-[#38FF7E]/10 to-[#38FF7E]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
              </>
            )}
          </Button>

          {/* Additional Links */}
          <div className="space-y-2">
            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-[#38FF7E]/80 hover:text-[#38FF7E] transition-colors"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#38FF7E]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#030A06] px-2 text-[#E3FFED]/50">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full border-[#38FF7E]/10 hover:border-[#38FF7E]/30 hover:bg-[#244A32]/20"
                disabled={isLoading}
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#38FF7E]/10 hover:border-[#38FF7E]/30 hover:bg-[#244A32]/20"
                disabled={isLoading}
              >
                <Icons.github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
