import { Suspense } from 'react';
import { Metadata } from 'next';
import SignUpForm from '@/components/auth/signup-form';
import { AuthLayout } from '@/components/layout/auth-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getTestimonial } from '@/lib/content/testimonials';

export const metadata: Metadata = {
  title: 'Sign Up | AgriSmart',
  description: 'Create your AgriSmart account and start optimizing your agricultural operations.',
};

export default function SignUpPage() {
  return (
    <AuthLayout testimonial={getTestimonial('signup')}>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join thousands of farmers optimizing their operations
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <LoadingSpinner size="md" text="Loading..." />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}