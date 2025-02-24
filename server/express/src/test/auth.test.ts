import './setup-tests';
import { describe, expect, it } from '@jest/globals';
import {
  createTestAgent,
  createTestUsers,
  assertSuccessResponse,
  assertUnauthorized,
  assertForbidden,
  assertValidationError,
  type TestResponse,
} from './test-helpers';
import { assertSuccessfulLogout, assertJsonResponse } from './assertions';
import type { UserRole } from '../types/models';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

interface AdminResponse {
  message: string;
}

describe('Auth API', () => {
  const agent = createTestAgent();
  const { regularUser, adminUser, regularToken, adminToken } = createTestUsers();

  describe('POST /api/auth/login', () => {
    const loginPath = '/api/auth/login';

    it('should login successfully with valid credentials', async () => {
      const response = await agent
        .post(loginPath)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        }) as unknown as TestResponse;

      assertJsonResponse(response);
      const data = assertSuccessResponse<LoginResponse>(response);
      expect(data.token).toBeTruthy();
      expect(data.user.email).toBe(regularUser.email);
      expect(data.user.role).toBe(regularUser.role);
    });

    it('should fail with invalid credentials', async () => {
      const response = await agent
        .post(loginPath)
        .send({
          email: regularUser.email,
          password: 'wrongpassword',
        }) as unknown as TestResponse;

      assertJsonResponse(response);
      assertUnauthorized(response);
    });

    it('should fail with invalid email format', async () => {
      const response = await agent
        .post(loginPath)
        .send({
          email: 'invalidemail',
          password: 'password123',
        }) as unknown as TestResponse;

      assertJsonResponse(response);
      assertValidationError(response);
    });
  });

  describe('GET /api/auth/me', () => {
    const mePath = '/api/auth/me';

    it('should get authenticated user profile', async () => {
      const response = await agent
        .get(mePath)
        .set('Authorization', `Bearer ${regularToken}`) as unknown as TestResponse;

      assertJsonResponse(response);
      const user = assertSuccessResponse<UserProfile>(response);
      expect(user.email).toBe(regularUser.email);
      expect(user.role).toBe(regularUser.role);
    });

    it('should fail without auth token', async () => {
      const response = await agent
        .get(mePath) as unknown as TestResponse;

      assertJsonResponse(response);
      assertUnauthorized(response);
    });
  });

  describe('GET /api/auth/admin', () => {
    const adminPath = '/api/auth/admin';

    it('should allow admin access', async () => {
      const response = await agent
        .get(adminPath)
        .set('Authorization', `Bearer ${adminToken}`) as unknown as TestResponse;

      assertJsonResponse(response);
      const data = assertSuccessResponse<AdminResponse>(response);
      expect(data.message).toBe('Admin access granted');
    });

    it('should deny regular user access', async () => {
      const response = await agent
        .get(adminPath)
        .set('Authorization', `Bearer ${regularToken}`) as unknown as TestResponse;

      assertJsonResponse(response);
      assertForbidden(response);
    });
  });

  describe('POST /api/auth/logout', () => {
    const logoutPath = '/api/auth/logout';

    it('should logout successfully', async () => {
      const response = await agent
        .post(logoutPath)
        .set('Authorization', `Bearer ${regularToken}`) as unknown as TestResponse;

      assertJsonResponse(response);
      assertSuccessfulLogout(response);
    });

    it('should fail without auth token', async () => {
      const response = await agent
        .post(logoutPath) as unknown as TestResponse;

      assertJsonResponse(response);
      assertUnauthorized(response);
    });
  });
});