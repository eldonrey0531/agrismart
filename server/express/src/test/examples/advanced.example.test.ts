import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import createTestHelper from './test-helpers';
import { api } from './api-builder';
import { HttpUtils } from './http-utils';
import { ErrorUtils } from './test-errors';
import { TimingUtils, TIMING } from './timing-utils';
import TEST_CONFIG, { createDefaultUser } from './test-config';
import type { 
  LoginData, 
  TestUser, 
  TokenResponse,
  SignupRequest,
  ChangePasswordRequest,
} from './response-types';

describe('Advanced Test Patterns', () => {
  const helper = createTestHelper();
  const { mockTokens } = TEST_CONFIG;

  beforeEach(() => {
    helper.setup({
      name: 'advanced-test',
      timeout: TIMING.timeout.test,
    });
    TimingUtils.timers.mock();
  });

  afterEach(() => {
    helper.cleanup();
    TimingUtils.timers.restore();
  });

  describe('Authentication Flow', () => {
    it('handles complete auth lifecycle', async () => {
      // 1. Sign up
      const signupData: SignupRequest = {
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      const newUser = createDefaultUser({
        id: '2',
        email: signupData.email,
        name: signupData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      helper.mockSuccess({
        user: newUser,
        token: mockTokens.valid,
      });

      const signupResponse = await fetch(
        api.auth.signup(signupData).build()
      );

      const signupResult = await HttpUtils.assert.assertSuccess<LoginData>(signupResponse);
      const token = signupResult.data.token;

      // 2. Get profile
      helper.mockSuccess({ user: signupResult.data.user });

      const profileResponse = await fetch(
        api.users.profile()
          .auth(token)
          .build()
      );

      await HttpUtils.assert.assertSuccess(profileResponse);

      // 3. Update profile
      const updatedUser = createDefaultUser({
        ...newUser,
        name: 'Updated Name',
        updatedAt: new Date(),
      });

      helper.mockSuccess({ user: updatedUser });

      const updateResponse = await fetch(
        api.users.updateProfile({ name: updatedUser.name }, token).build()
      );

      await HttpUtils.assert.assertSuccess(updateResponse);

      // 4. Change password
      const passwordData: ChangePasswordRequest = {
        currentPassword: signupData.password,
        newPassword: 'NewPass456!',
      };

      helper.mockSuccess({ success: true });

      const passwordResponse = await fetch(
        api.users.changePassword(passwordData, token).build()
      );

      await HttpUtils.assert.assertSuccess(passwordResponse);

      // 5. Logout
      helper.mockSuccess({ success: true });

      const logoutResponse = await fetch(
        api.auth.logout(token).build()
      );

      await HttpUtils.assert.assertSuccess(logoutResponse);

      // 6. Try accessing protected route - should fail
      helper.mockError(
        ErrorUtils.factory.unauthorized('invalidToken')
      );

      const protectedResponse = await fetch(
        api.users.profile()
          .auth(token)
          .build()
      );

      await HttpUtils.assert.assertError(protectedResponse, {
        type: ErrorUtils.type.AUTHORIZATION,
        status: ErrorUtils.status.UNAUTHORIZED,
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('handles multiple requests with rate limiting', async () => {
      // Setup initial state
      const requests = Array(5).fill(null).map(() => 
        api.auth.login().build()
      );

      // First request succeeds
      helper.mockSuccess({ token: mockTokens.valid });
      const firstResponse = await fetch(requests[0]);
      await HttpUtils.assert.assertSuccess(firstResponse);

      // Next requests fail with rate limit
      helper.mockError(
        ErrorUtils.factory.rateLimit(TIMING.timeout.request)
      );

      // Make concurrent requests
      const responses = await Promise.all(
        requests.slice(1).map(request => fetch(request))
      );

      // Verify rate limits
      for (const response of responses) {
        await HttpUtils.assert.assertError(response, {
          type: ErrorUtils.type.RATE_LIMIT,
          status: ErrorUtils.status.TOO_MANY_REQUESTS,
        });
      }

      // Wait for rate limit reset
      await helper.waitForRateLimit();

      // Should work again
      helper.mockSuccess({ token: mockTokens.valid });
      const resetResponse = await fetch(requests[0]);
      await HttpUtils.assert.assertSuccess(resetResponse);
    });
  });

  describe('Error Recovery', () => {
    it('handles transient errors with retry', async () => {
      const maxRetries = 3;
      let attempts = 0;

      // Setup request
      const request = api.auth.login().build();

      // Mock network errors for first attempts
      while (attempts < maxRetries - 1) {
        helper.mockError(
          ErrorUtils.factory.network('connectionFailed')
        );

        try {
          await fetch(request);
        } catch (error) {
          attempts++;
          await TimingUtils.wait(TIMING.interval.retry);
        }
      }

      // Last attempt succeeds
      helper.mockSuccess({ token: mockTokens.valid });
      const response = await fetch(request);
      await HttpUtils.assert.assertSuccess(response);

      // Verify retry count
      expect(attempts).toBe(maxRetries - 1);
    });
  });

  describe('Session Management', () => {
    it('handles session expiration and refresh', async () => {
      const defaultUser = createDefaultUser();

      // Initial login
      helper.mockSuccess({
        user: defaultUser,
        token: mockTokens.valid,
      });

      const loginResponse = await fetch(
        api.auth.login().build()
      );

      const { token } = (await HttpUtils.assert.assertSuccess<LoginData>(loginResponse)).data;

      // Session expires
      helper.mockError(
        ErrorUtils.factory.unauthorized('sessionExpired')
      );

      const expiredResponse = await fetch(
        api.users.profile()
          .auth(token)
          .build()
      );

      await HttpUtils.assert.assertError(expiredResponse, {
        type: ErrorUtils.type.AUTHORIZATION,
        status: ErrorUtils.status.UNAUTHORIZED,
      });

      // Refresh token
      const refreshData: TokenResponse = {
        token: mockTokens.valid,
      };
      helper.mockSuccess(refreshData);

      const refreshResponse = await fetch(
        api.auth.refresh(token).build()
      );

      const { token: newToken } = (await HttpUtils.assert.assertSuccess<TokenResponse>(refreshResponse)).data;

      // Use new token
      helper.mockSuccess({ user: defaultUser });

      const profileResponse = await fetch(
        api.users.profile()
          .auth(newToken)
          .build()
      );

      await HttpUtils.assert.assertSuccess(profileResponse);
    });
  });
});