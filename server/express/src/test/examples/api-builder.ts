import { HttpUtils } from './http-utils';
import TEST_CONFIG, { type ApiPaths } from './test-config';
import type { LoginRequest, SignupRequest } from './response-types';

/**
 * API endpoints builder
 */
export class ApiBuilder {
  private readonly paths: ApiPaths;

  constructor(
    private readonly baseUrl: string = TEST_CONFIG.api.baseUrl,
    paths: ApiPaths = TEST_CONFIG.api.paths
  ) {
    this.paths = paths;
  }

  /**
   * Create full URL
   */
  private createUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Auth endpoints
   */
  auth = {
    /**
     * Login endpoint
     */
    login: (credentials?: LoginRequest) =>
      HttpUtils.createRequest(this.createUrl(this.paths.auth.login))
        .method('POST')
        .json(credentials ?? {
          email: TEST_CONFIG.defaultUser.email,
          password: 'Test123!@#',
        }),

    /**
     * Signup endpoint
     */
    signup: (userData?: SignupRequest) =>
      HttpUtils.createRequest(this.createUrl(this.paths.auth.signup))
        .method('POST')
        .json(userData ?? {
          email: TEST_CONFIG.defaultUser.email,
          password: 'Test123!@#',
          name: TEST_CONFIG.defaultUser.name,
        }),

    /**
     * Logout endpoint
     */
    logout: (token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.auth.logout))
        .method('POST')
        .auth(token ?? TEST_CONFIG.mockTokens.valid),

    /**
     * Get current user
     */
    me: (token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.auth.me))
        .method('GET')
        .auth(token ?? TEST_CONFIG.mockTokens.valid),

    /**
     * Refresh token
     */
    refresh: (token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.auth.refresh))
        .method('POST')
        .auth(token ?? TEST_CONFIG.mockTokens.valid),
  };

  /**
   * User endpoints
   */
  users = {
    /**
     * Get user profile
     */
    profile: (token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.users.profile))
        .method('GET')
        .auth(token ?? TEST_CONFIG.mockTokens.valid),

    /**
     * Update user profile
     */
    updateProfile: (data: Partial<typeof TEST_CONFIG.defaultUser>, token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.users.profile))
        .method('PATCH')
        .auth(token ?? TEST_CONFIG.mockTokens.valid)
        .json(data),

    /**
     * Change password
     */
    changePassword: (data: { 
      currentPassword: string; 
      newPassword: string;
    }, token?: string) =>
      HttpUtils.createRequest(this.createUrl(this.paths.users.password))
        .method('POST')
        .auth(token ?? TEST_CONFIG.mockTokens.valid)
        .json(data),
  };
}

/**
 * Create API builder with optional configuration
 */
export function createApiBuilder(config?: {
  baseUrl?: string;
  paths?: ApiPaths;
}): ApiBuilder {
  return new ApiBuilder(
    config?.baseUrl,
    config?.paths
  );
}

/**
 * Default API builder instance
 */
export const api = createApiBuilder();

export default api;