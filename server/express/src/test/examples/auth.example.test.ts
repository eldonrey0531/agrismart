import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import createTestHelper from './test-helpers';
import createAuthAssertions from './auth-assertions';
import { HttpUtils } from './http-utils';
import { ErrorUtils } from './test-errors';
import { api } from './api-builder';
import TEST_CONFIG from './test-config';
import type { LoginData } from './response-types';

describe('Authentication API', () => {
  const helper = createTestHelper();
  const assert = createAuthAssertions(helper);
  const { defaultUser, mockTokens, rateLimiting } = TEST_CONFIG;

  beforeEach(() => {
    helper.setup({
      name: 'auth-test',
      timeout: TEST_CONFIG.api.timeout,
    });
  });

  afterEach(() => {
    helper.cleanup();
  });

  describe('Login', () => {
    it('successfully logs in with valid credentials', async () => {
      // Arrange
      const loginData: LoginData = {
        user: defaultUser,
        token: mockTokens.valid,
      };
      helper.mockSuccess(loginData);

      // Act
      const response = await fetch(
        api.auth.login({
          email: defaultUser.email,
          password: 'Test123!@#',
        }).build()
      );

      // Assert
      const data = await HttpUtils.assert.assertSuccess<LoginData>(response);
      expect(data.data).toEqual(loginData);
      HttpUtils.assert.assertHeaders(response, TEST_CONFIG.security.headers);
    });

    it('handles invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'wrong@example.com',
        password: 'wrongpass',
      };

      helper.mockError(
        ErrorUtils.factory.invalidCredentials()
      );

      // Act
      const response = await fetch(
        api.auth.login(invalidCredentials).build()
      );

      // Assert
      await HttpUtils.assert.assertError(response, {
        type: ErrorUtils.type.AUTHENTICATION,
        message: TEST_CONFIG.errors.auth.invalidCredentials,
        status: HttpUtils.status.UNAUTHORIZED,
      });
    });

    describe('rate limiting', () => {
      it('enforces rate limits', async () => {
        // Arrange
        const { maxAttempts } = rateLimiting;
        const loginRequest = api.auth.login().build();

        // Make requests until rate limit is exceeded
        for (let i = 0; i < maxAttempts; i++) {
          // Arrange
          helper.mockError(ErrorUtils.factory.invalidCredentials());

          // Act
          const response = await fetch(loginRequest);
          
          // Assert
          const limits = helper.getRateLimits();
          assert.assertRateLimit(limits, maxAttempts - i - 1);
        }

        // Next request should be rate limited
        helper.mockError(
          ErrorUtils.factory.rateLimit(rateLimiting.blockDuration / 1000)
        );

        const blockedResponse = await fetch(loginRequest);
        await HttpUtils.assert.assertError(blockedResponse, {
          type: ErrorUtils.type.RATE_LIMIT,
          message: TEST_CONFIG.errors.auth.rateLimitExceeded,
          status: HttpUtils.status.TOO_MANY_REQUESTS,
        });

        // Wait for rate limit reset
        await helper.waitForRateLimit();

        // Should work again after reset
        const resetLoginData: LoginData = {
          user: defaultUser,
          token: mockTokens.valid,
        };
        helper.mockSuccess(resetLoginData);

        const resetResponse = await fetch(loginRequest);
        const resetData = await HttpUtils.assert.assertSuccess<LoginData>(resetResponse);
        expect(resetData.data).toEqual(resetLoginData);
      });
    });

    describe('error handling', () => {
      it('handles validation errors', async () => {
        // Arrange
        const invalidCredentials = {
          email: 'notanemail',
          password: '',
        };

        helper.mockError(
          ErrorUtils.factory.validation('email', 'Invalid email format')
        );

        // Act
        const response = await fetch(
          api.auth.login(invalidCredentials).build()
        );

        // Assert
        await HttpUtils.assert.assertError(response, {
          type: ErrorUtils.type.VALIDATION,
          message: TEST_CONFIG.errors.validation.invalid('email'),
          status: HttpUtils.status.BAD_REQUEST,
        });
      });

      it('handles network errors', async () => {
        // Arrange
        helper.mockError(
          ErrorUtils.factory.network(TEST_CONFIG.errors.network.timeout)
        );

        // Act & Assert
        await expect(
          fetch(api.auth.login().build())
        ).rejects.toThrow(TEST_CONFIG.errors.network.timeout);
      });
    });
  });
});