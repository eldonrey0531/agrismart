import { createContext, useContext, useCallback } from 'react';
import type { User } from '@prisma/client';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  signOut: async () => {},
  register: async () => {},
});

/**
 * Hook for accessing authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const enhancedSignOut = useCallback(async () => {
    try {
      await api.auth.logout();
      router.push('/login');
      toast({
        title: 'Logged out successfully',
        description: 'Come back soon!'
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error logging out',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [router, toast]);

  return {
    ...context,
    signOut: enhancedSignOut
  };
}

export default useAuth;
