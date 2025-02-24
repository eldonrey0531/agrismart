'use client';

import { AuthProvider as AuthContextProvider } from '@/contexts/auth-context';

export function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}

export default AuthProviderWrapper;