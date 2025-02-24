export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// API error response
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: Record<string, string[]>;
  };
}

// API success response
export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}