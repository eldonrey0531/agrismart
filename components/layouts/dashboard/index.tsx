'use client';

import { PropsWithChildren } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Icons } from '@/components/ui/icons';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-4 py-3">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
