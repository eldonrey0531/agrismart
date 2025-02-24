import { expect } from '@jest/globals';
import { mockUser, mockCredentials, mockLoginResponse, AuthError } from './auth-types';
import type { LoginCredentials, LoginResponse } from './auth-types';
import testUtils from '../helpers';
import { validateResponse } from '../assertions';

/**
 * Mock fetch type
 */
type FetchMock = jest.Mock<
  Promise<Response>,
  [input: string | URL | Request, init?: RequestInit]
>;

declare global {
  var mockFetch: FetchMock;
}

/**
 * API URL configuration
 */
export const API_URLS = {
  base: 'http://localhost:3000/api',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
} as const;

/**
 * Request options type
 */
interface AuthRequestOptions extends RequestInit {
  token?: string;
}

/**
 * Auth request helpers
 */
export const authRequest = {
  /**
   * Get full URL
   */
  getUrl: (path: string) => `${API_URLS.base}${path}`,

  /**
   * Create authenticated request options
   */
  createOptions: (options: AuthRequestOptions = {}): RequestInit => {
    const { token, ...rest } = options;
    return {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...rest.headers,
      },
    };
  },

  /**
   * Perform login request
   */
  login: async (credentials: LoginCredentials = mockCredentials) => {
    return fetch(authRequest.getUrl(API_URLS.auth.login), {
      method: 'POST',
      ...authRequest.createOptions({
        body: JSON.stringify(credentials),
      }),
    });
  },

  /**
   * Perform signup request
   */
  signup: async (userData: Partial<typeof mockUser>) => {
    return fetch(authRequest.getUrl(API_URLS.auth.signup), {
      method: 'POST',
      ...authRequest.createOptions({
        body: JSON.stringify(userData),
      }),
    });
  },

  /**
   * Perform authenticated request
   */
  withAuth: async (
    url: string,
    options: AuthRequestOptions = {},
    token = mockLoginResponse.token
  ) => {
    return fetch(url, authRequest.createOptions({ ...options, token }));
  },
};

/**
 * Auth mock helpers
 */
export const authMock = {
  /**
   * Mock successful login
   */
  loginSuccess: (response: LoginResponse = mockLoginResponse) => {
    testUtils.fetch.success(response);
    return response;
  },

  /**
   * Mock invalid credentials error
   */
  invalidCredentials: (message?: string) => {
    const error = AuthError.invalidCredentials(message);
    testUtils.fetch.error(error.type, error.message, { status: error.status });
    return error;
  },

  /**
   * Mock validation error
   */
  validationError: (message: string) => {
    const error = AuthError.validation(message);
    testUtils.fetch.error(error.type, error.message, { status: error.status });
    return error;
  },

  /**
   * Mock unauthorized error
   */
  unauthorized: (message?: string) => {
    const error = AuthError.unauthorized(message);
    testUtils.fetch.error(error.type, error.message, { status: error.status });
    return error;
  },

  /**
   * Mock server error
   */
  serverError: (message?: string) => {
    const error = AuthError.internal(message);
    testUtils.fetch.error(error.type, error.message, { status: error.status });
    return error;
  },
};

/**
 * Auth validation helpers
 */
export const authValidate = {
  /**
   * Validate successful login
   */
  loginSuccess: async (response: Response) => {
    const data = await validateResponse.success<LoginResponse>(response);
    expect(data.data.user.email).toBe(mockUser.email);
    expect(data.data.token).toBeTruthy();
    return data;
  },

  /**
   * Validate login request was made correctly
   */
  loginRequest: (credentials = mockCredentials) => {
    expect(global.mockFetch).toHaveBeenCalledWith(
      authRequest.getUrl(API_URLS.auth.login),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(credentials),
      })
    );
  },

  /**
   * Validate auth header
   */
  authHeader: (token = mockLoginResponse.token) => {
    expect(global.mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  },
};

/**
 * Auth mock data
 */
export const authMockData = {
  user: mockUser,
  credentials: mockCredentials,
  loginResponse: mockLoginResponse,
};

/**
 * Auth test utilities
 */
export const authTestUtils = {
  request: authRequest,
  mock: authMock,
  validate: authValidate,
  mockData: authMockData,
  urls: API_URLS,
};

export default authTestUtils;