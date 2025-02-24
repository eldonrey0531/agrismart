import {
  ApiResponse,
  AuthResponse,
  UserResponse,
  isSuccessResponse,
  API_ENDPOINTS,
  DEFAULT_API_CONFIG
} from '@/lib/api-types';
import { handleApiError, ApiError, ErrorMessages } from '@/lib/utils/error-handler';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${DEFAULT_API_CONFIG.baseURL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      ...DEFAULT_API_CONFIG.headers,
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    let data: any;

    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        response.ok ? 'Invalid response format' : 'Server error',
        response.ok ? 'INVALID_RESPONSE' : 'SERVER_ERROR'
      );
    }

    // If the response is not ok, throw an error
    if (!response.ok) {
      throw new ApiError(
        data.message || ErrorMessages.API.SERVER_ERROR,
        data.error?.code || `HTTP_${response.status}`,
        data.error?.details
      );
    }

    // Check if the response has the expected success format
    if (!isSuccessResponse(data)) {
      throw new ApiError(
        data.message || ErrorMessages.API.REQUEST_FAILED,
        'INVALID_RESPONSE_FORMAT'
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    throw handleApiError(error);
  }
}

export const apiClient = {
  auth: {
    login: async (email: string, password: string) => 
      fetchApi<AuthResponse['data']>(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }),

    logout: async () => 
      fetchApi<void>(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      }),

    me: async () => 
      fetchApi<UserResponse['data']>(API_ENDPOINTS.auth.me, {
        method: 'GET',
      }),

    refreshToken: async () => 
      fetchApi<AuthResponse['data']>(API_ENDPOINTS.auth.refreshToken, {
        method: 'POST',
      }),
  },

  users: {
    getProfile: async () => 
      fetchApi<UserResponse['data']>(API_ENDPOINTS.users.profile, {
        method: 'GET',
      }),

    updateProfile: async (data: Record<string, any>) => 
      fetchApi<UserResponse['data']>(API_ENDPOINTS.users.profile, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),

    updateSettings: async (data: Record<string, any>) => 
      fetchApi<UserResponse['data']>(API_ENDPOINTS.users.settings, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
  },
};