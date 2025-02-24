'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { LoginForm } from '@/components/auth/login-form';
import { AuthDebug } from '@/components/auth/auth-debug';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getTestimonial } from '@/lib/content/testimonials';
import { Icons } from '@/components/ui/icons';

export function LoginPageContent() {
  const testimonial = getTestimonial('login');

  return (
    <AuthLayout testimonial={testimonial}>
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-[#E3FFED]/70">
          Enter your credentials to access your account
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#38FF7E]/20 to-transparent animate-pulse" />
              <Icons.spinner className="h-8 w-8 animate-spin text-[#38FF7E]" />
            </div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      {/* Debug component - only shows in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 rounded-lg bg-gradient-to-br from-[#244A32]/20 to-[#172F21]/20 backdrop-blur-sm p-4">
          <AuthDebug />
        </div>
      )}
    </AuthLayout>
  );
}