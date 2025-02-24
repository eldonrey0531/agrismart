import { expect } from '@jest/globals';
import TEST_CONFIG from './test-config';
import type { TestHelper } from './test-helpers';
import type { SuccessResponse, ErrorResponse } from './test-helpers';

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface LoginData {
  user: TestUser;
  token: string;
}

interface LoginResponse extends SuccessResponse<LoginData> {}

/**
 * Authentication test assertions
 */
export class AuthAssertions {
  constructor(
    private helper: TestHelper,
    private config = TEST_CONFIG
  ) {}

  /**
   * Assert successful login
   */
  async assertSuccessfulLogin(
    response: Response,
    expectedUser = this.config.defaultUser
  ): Promise<LoginResponse> {
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);

    const data = await response.json() as LoginResponse;
    expect(data.success).toBe(true);
    expect(data.data.user).toEqual(expectedUser);
    expect(data.data.token).toBeTruthy();

    return data;
  }

  /**
   * Assert invalid credentials error
   */
  async assertInvalidCredentials(response: Response): Promise<ErrorResponse> {
    expect(response.status).toBe(401);
    expect(response.ok).toBe(false);
    expect(response.headers.get('WWW-Authenticate')).toBe('Bearer');

    const data = await response.json() as ErrorResponse;
    expect(data).toEqual({
      success: false,
      type: 'INVALID_CREDENTIALS',
      message: this.config.errors.auth.invalidCredentials,
    });

    return data;
  }

  /**
   * Assert rate limit tracking
   */
  assertRateLimit(
    limits: { remaining: number } | undefined,
    expectedRemaining: number
  ): void {
    expect(limits).toBeDefined();
    expect(limits?.remaining).toBe(expectedRemaining);
  }

  /**
   * Assert rate limit exceeded
   */
  async assertRateLimitExceeded(response: Response): Promise<ErrorResponse> {
    expect(response.status).toBe(429);
    expect(response.ok).toBe(false);

    const data = await response.json() as ErrorResponse;
    expect(data.type).toBe('RATE_LIMIT_EXCEEDED');
    expect(data.message).toBe(this.config.errors.auth.rateLimitExceeded);
    expect(data.data?.retryAfter).toBeGreaterThan(0);

    return data;
  }

  /**
   * Assert proper request headers
   */
  assertRequestHeaders(response: Response): void {
    Object.entries(this.config.security.headers).forEach(([key, value]) => {
      expect(response.headers.get(key.toLowerCase())).toBe(value);
    });
  }

  /**
   * Assert proper error response
   */
  async assertErrorResponse(
    response: Response,
    expectedError: {
      type: string;
      message: string;
      status: number;
    }
  ): Promise<ErrorResponse> {
    expect(response.status).toBe(expectedError.status);
    expect(response.ok).toBe(false);

    const data = await response.json() as ErrorResponse;
    expect(data).toEqual({
      success: false,
      type: expectedError.type,
      message: expectedError.message,
    });

    return data;
  }

  /**
   * Create login request
   */
  createLoginRequest(credentials: { email: string; password: string }): Request {
    return new Request(`${this.config.api.baseUrl}${this.config.api.paths.auth.login}`, {
      method: 'POST',
      headers: this.config.security.headers,
      body: JSON.stringify(credentials),
    });
  }
}

/**
 * Create auth assertions helper
 */
export function createAuthAssertions(helper: TestHelper): AuthAssertions {
  return new AuthAssertions(helper);
}

export default createAuthAssertions;