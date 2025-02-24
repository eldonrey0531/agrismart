import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface AuthRequiredProps {
  children: ReactNode;
  redirectTo?: string;
}

export const AuthRequired = ({ 
  children, 
  redirectTo = '/auth/login' 
}: AuthRequiredProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null; // Or loading spinner
  }

  if (!user) {
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
};

export default AuthRequired;