'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { AuthGuard } from '@/components/auth/auth-guard';

interface AgriSmartLayoutProps {
  children: React.ReactNode;
}

export default function AgriSmartLayout({ children }: AgriSmartLayoutProps) {
  return (
    <AuthGuard>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthGuard>
  );
}

// Metadata for the AgriSmart section
export const metadata = {
  title: 'AgriSmart Platform',
  description: 'Smart agricultural management platform for modern farming',
};