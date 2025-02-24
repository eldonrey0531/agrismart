'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout
      requireAuth={false}
      requireUnauth={true}
      redirectTo="/dashboard"
      fullScreenLoading={false}
    >
      {children}
    </ProtectedLayout>
  );
}