import { useState, useEffect } from 'react';
import { useAPI } from '@/hooks/useAPI';

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  
  const api = useAPI();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await api.get('/api/auth/session');
        setState({
          user: response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error as Error
        });
      }
    };

    validateSession();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      setState({
        user: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        ...state,
        error: error as Error
      });
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        ...state,
        error: error as Error
      });
    }
  };

  return {
    ...state,
    login,
    logout
  };
};

export default useAuth;