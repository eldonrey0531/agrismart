import { useApiMutation } from './use-api';
import { LoginInput, SignupInput } from '@/lib/validations/form';
import { useRouter } from 'next/router';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface PasswordResetResponse {
  message: string;
}

export function useAuthApi() {
  const router = useRouter();

  const login = useApiMutation<AuthResponse, LoginInput>('/auth/login', {
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('auth_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);

      // Store minimal user data
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect based on role
      if (data.data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    },
  });

  const signup = useApiMutation<AuthResponse, SignupInput>('/auth/signup', {
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('auth_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);

      // Store minimal user data
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    },
  });

  const logout = useApiMutation<{ message: string }, void>('/auth/logout', {
    onSuccess: () => {
      // Clear stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Redirect to login
      router.push('/login');
    },
  });

  const requestPasswordReset = useApiMutation<PasswordResetResponse, { email: string }>(
    '/auth/forgot-password',
    {
      onSuccess: () => {
        // Show success message is handled by the form component
      },
    }
  );

  const resetPassword = useApiMutation<
    PasswordResetResponse,
    {
      token: string;
      password: string;
    }
  >('/auth/reset-password', {
    onSuccess: () => {
      router.push('/login');
    },
  });

  const resendVerification = useApiMutation<
    { message: string },
    { email: string }
  >('/auth/resend-verification', {
    onSuccess: () => {
      // Show success message is handled by the form component
    },
  });

  return {
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    resendVerification,
    // Helper function to check if user is authenticated
    isAuthenticated: () => {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem('auth_token');
    },
    // Helper function to get current user
    getCurrentUser: () => {
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
  };
}

export default useAuthApi;