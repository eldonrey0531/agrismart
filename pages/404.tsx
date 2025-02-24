'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { AuthDebug } from '@/components/auth/auth-debug';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[500px] flex-col items-center space-y-4 px-4">
        <Icons.warning className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-center text-2xl font-bold">Page Not Found</h1>
        <p className="text-center text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex space-x-4">
          <ButtonWrapper variant="outline" onClickHandler={() => router.back()}>
            Go Back
          </ButtonWrapper>
          <ButtonWrapper onClickHandler={() => router.push('/')}>
            Go Home
          </ButtonWrapper>
        </div>
      </div>
      <AuthDebug />
    </div>
  );
}