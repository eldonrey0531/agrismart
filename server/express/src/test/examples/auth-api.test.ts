import { describe, it, beforeEach, expect } from '@jest/globals';
import authTestUtils from './auth-test-utils';
import authAssert from './auth-assertions';
import rateLimitAssert from './rate-limit-helpers';
import TEST_CONFIG from '../test-config';
import type { LoginResponse } from './auth-types';

const { request, mock, mockData } = authTestUtils;
const { api, rateLimits, errors } = TEST_CONFIG;

describe('Authentication API', () => {
  const LOGIN_URL = `${api.baseUrl}${api.paths.auth.login}`;

  beforeEach(() => {
    global.mockFetch.mockClear();
    jest.setTimeout(api.timeout);
  });

  describe('POST /auth/login', () => {
    describe('successful login', () => {
      it('logs in user with valid credentials', async () => {
        // Arrange
        mock.loginSuccess();

        // Act
        const response = await request.login();

        // Assert
        const loginData = await authAssert.loginSuccess(response);
        authAssert.user(loginData.user);
        authAssert.token(loginData.token);
        authAssert.loginRequest(LOGIN_URL, TEST_CONFIG.mockData.users.valid);
      });

      it('returns admin user data', async () => {
        // Arrange
        const adminData = TEST_CONFIG.mockData.users.admin;
        const customData: LoginResponse = {
          user: {
            ...mockData.user,
            ...adminData,
          },
          token: mockData.loginResponse.token,
        };
        mock.loginSuccess(customData);

        // Act
        const response = await request.login({
          email: adminData.email,
          password: adminData.password,
        });

        // Assert
        const loginData = await authAssert.loginSuccess(response, customData);
        authAssert.user(loginData.user, {
          role: 'ADMIN',
          name: adminData.name,
        });
      });

      it('includes security headers', async () => {
        // Arrange
        mock.loginSuccess();

        // Act
        const response = await request.login();

        // Assert
        await authAssert.loginSuccess(response);
        Object.entries(TEST_CONFIG.security.headers).forEach(([header, value]) => {
          expect(response.headers.get(header)).toBe(value);
        });
      });
    });

    describe('rate limiting', () => {
      const { maxAttempts, blockDuration } = rateLimits.auth;

      it('tracks remaining requests', async () => {
        // Arrange
        mock.loginSuccess();

        // Act
        const firstResponse = await request.login();
        const secondResponse = await request.login();

        // Assert
        const firstLimits = rateLimitAssert.getRateLimits(firstResponse);
        const secondLimits = rateLimitAssert.getRateLimits(secondResponse);

        expect(firstLimits.limit).toBe(maxAttempts);
        rateLimitAssert.decremented(firstLimits, secondLimits);
      });

      it('blocks after max attempts', async () => {
        // Arrange
        const invalidCredentials = {
          email: 'wrong@example.com',
          password: 'wrongpass',
        };

        // Act & Assert
        // Make requests until rate limit is exceeded
        for (let i = 0; i < maxAttempts; i++) {
          const response = await request.login(invalidCredentials);
          const limits = rateLimitAssert.getRateLimits(response);
          expect(limits.remaining).toBe(maxAttempts - i - 1);
        }

        // Next request should be blocked
        const blockedResponse = await request.login(invalidCredentials);
        const exceededInfo = rateLimitAssert.exceeded(blockedResponse);
        expect(exceededInfo.retryAfter).toBeLessThanOrEqual(blockDuration / 1000);
      });
    });

    describe('validation errors', () => {
      it('handles invalid email format', async () => {
        // Arrange
        const invalidCredentials = {
          email: 'notanemail',
          password: TEST_CONFIG.mockData.users.valid.password,
        };

        // Act
        const response = await request.login(invalidCredentials);

        // Assert
        await authAssert.validationError(
          response,
          'email',
          errors.validation.email.invalid
        );
      });

      it('handles missing password', async () => {
        // Arrange
        const invalidCredentials = {
          email: TEST_CONFIG.mockData.users.valid.email,
          password: '',
        };

        // Act
        const response = await request.login(invalidCredentials);

        // Assert
        await authAssert.validationError(
          response,
          'password',
          errors.validation.password.required
        );
      });
    });

    describe('authentication errors', () => {
      it('handles invalid credentials', async () => {
        // Arrange
        const wrongCredentials = {
          email: 'wrong@example.com',
          password: 'wrongpass',
        };

        // Act
        const response = await request.login(wrongCredentials);

        // Assert
        await authAssert.invalidCredentials(response);
        expect(response.headers.get('WWW-Authenticate')).toBe('Bearer');
      });

      it('handles locked account', async () => {
        // Arrange
        mock.unauthorized(errors.validation.auth.accountLocked);

        // Act
        const response = await request.login(TEST_CONFIG.mockData.users.valid);

        // Assert
        await authAssert.unauthorized(
          response,
          errors.validation.auth.accountLocked
        );
      });
    });
  });
});