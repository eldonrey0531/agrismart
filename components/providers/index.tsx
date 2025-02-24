'use client';

import { PropsWithChildren } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps extends PropsWithChildren {
  enableAuth?: boolean;
  enableTheme?: boolean;
  enableQuery?: boolean;
}

export function Providers({
  children,
  enableAuth = true,
  enableTheme = true,
  enableQuery = true,
}: ProvidersProps) {
  // Wrap children with necessary providers
  let content = <>{children}</>;

  // Add React Query provider
  if (enableQuery) {
    content = (
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    );
  }

  // Add Authentication provider
  if (enableAuth) {
    content = (
      <SessionProvider>
        <AuthProvider>
          {content}
        </AuthProvider>
      </SessionProvider>
    );
  }

  // Add Theme provider
  if (enableTheme) {
    content = (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {content}
      </ThemeProvider>
    );
  }

  return (
    <>
      {content}
      <Toaster />
    </>
  );
}

/**
 * Default provider configuration
 */
export default function DefaultProviders({ children }: PropsWithChildren) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
