import { describe, it, expect } from '@jest/globals';
import { request, createTestUser, createTestAdmin, prisma } from '../../test/setup';
import { UserRole } from '../../types/shared';
import { hashPassword } from '../../utils/auth';
import { assertResponse } from '../../test/helpers';
import type { TestResponse } from '../../types/test';

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const password = 'TestPass123!';
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await hashPassword(password),
          role: UserRole.USER,
        },
      });

      // Attempt login
      const response: TestResponse = await request
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        });

      // Verify response
      const data = assertResponse.success(response);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(user.email);
      expect(data.user).not.toHaveProperty('password');
    });

    it('should reject invalid password', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await hashPassword('correct-password'),
          role: UserRole.USER,
        },
      });

      // Attempt login with wrong password
      const response: TestResponse = await request
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrong-password',
        });

      // Verify response
      assertResponse.error(response, 401, 'Invalid credentials');
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'NewPass123!',
      };

      const response: TestResponse = await request
        .post('/api/auth/signup')
        .send(userData);

      // Verify response
      const data = assertResponse.success(response, 201);
      expect(data).toHaveProperty('token');
      expect(data.user.email).toBe(userData.email);

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.role).toBe(UserRole.USER);
    });

    it('should reject duplicate email', async () => {
      // Create initial user
      const existingUser = await createTestUser();

      // Attempt to create user with same email
      const response: TestResponse = await request
        .post('/api/auth/signup')
        .send({
          email: existingUser.email,
          password: 'NewPass123!',
        });

      // Verify response
      assertResponse.error(response, 400, 'Email already exists');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile', async () => {
      // Create and authenticate user
      const user = await createTestUser();

      const response: TestResponse = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user.accessToken}`);

      // Verify response
      const data = assertResponse.success(response);
      expect(data.id).toBe(user.id);
      expect(data.email).toBe(user.email);
      expect(data).not.toHaveProperty('password');
    });

    it('should reject unauthenticated request', async () => {
      const response: TestResponse = await request.get('/api/auth/me');
      assertResponse.error(response, 401, 'Authentication required');
    });
  });

  describe('GET /api/auth/admin', () => {
    it('should allow admin access', async () => {
      const admin = await createTestAdmin();

      const response: TestResponse = await request
        .get('/api/auth/admin')
        .set('Authorization', `Bearer ${admin.accessToken}`);

      assertResponse.success(response);
    });

    it('should reject non-admin users', async () => {
      const user = await createTestUser();

      const response: TestResponse = await request
        .get('/api/auth/admin')
        .set('Authorization', `Bearer ${user.accessToken}`);

      assertResponse.error(response, 403, 'Admin access required');
    });
  });
});