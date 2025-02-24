import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { generateToken, verifyToken } from '../utils/jwt';
import { TokenPayload, AuthErrorType } from '../types/auth';
import { hasAllPermissions, Permission, UserRole } from '../types/models';
import {
  TestResponse,
  assertSuccessResponse,
  assertErrorResponse,
  createAuthHeader,
  createTestUser,
  createTestAdmin,
} from '../types/test';

describe('Authentication System', () => {
  const testUser = createTestUser();
  const testAdmin = createTestAdmin();

  describe('JWT Utilities', () => {
    it('should generate valid access tokens', async () => {
      const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        id: testUser.id,
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        type: 'access',
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.type).toBe('access');
    });

    it('should verify tokens correctly', () => {
      const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        id: testUser.id,
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        type: 'access',
      };

      const token = generateToken(payload);
      expect(() => verifyToken(token)).not.toThrow();
    });

    it('should reject expired tokens', () => {
      const token = jwt.sign(
        {
          id: testUser.id,
          sub: testUser.id,
          email: testUser.email,
          role: testUser.role,
          type: 'access',
        } as TokenPayload,
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      expect(() => verifyToken(token)).toThrow();
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401) as unknown as TestResponse;

      assertErrorResponse(response, 401, AuthErrorType.UNAUTHORIZED);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401) as unknown as TestResponse;

      assertErrorResponse(response, 401, AuthErrorType.INVALID_TOKEN);
    });

    it('should accept valid tokens', async () => {
      const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        id: testUser.id,
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        type: 'access',
      };

      const token = generateToken(payload);
      const headers = createAuthHeader(token);

      const response = await request(app)
        .get('/api/protected')
        .set(headers)
        .expect(200) as unknown as TestResponse;

      assertSuccessResponse(response);
    });
  });

  describe('Authorization', () => {
    it('should enforce role-based access control', async () => {
      // Create tokens
      const userToken = generateToken({
        id: testUser.id,
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        type: 'access',
      });

      const adminToken = generateToken({
        id: testAdmin.id,
        sub: testAdmin.id,
        email: testAdmin.email,
        role: testAdmin.role,
        type: 'access',
      });

      // User cannot access admin route
      const userResponse = await request(app)
        .get('/api/admin')
        .set(createAuthHeader(userToken))
        .expect(403) as unknown as TestResponse;

      assertErrorResponse(userResponse, 403, AuthErrorType.FORBIDDEN);

      // Admin can access admin route
      const adminResponse = await request(app)
        .get('/api/admin')
        .set(createAuthHeader(adminToken))
        .expect(200) as unknown as TestResponse;

      assertSuccessResponse(adminResponse);
    });

    it('should enforce permission-based access control', () => {
      // User permissions
      expect(hasAllPermissions(UserRole.USER, [Permission.READ])).toBe(true);
      expect(hasAllPermissions(UserRole.USER, [Permission.MANAGE])).toBe(false);

      // Admin permissions
      expect(hasAllPermissions(UserRole.ADMIN, [Permission.MANAGE])).toBe(true);
      expect(hasAllPermissions(UserRole.ADMIN, [
        Permission.READ,
        Permission.WRITE,
        Permission.DELETE,
      ])).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
        id: testUser.id,
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
        type: 'access',
      };

      const token = generateToken(payload);
      const headers = createAuthHeader(token);

      // Make multiple requests
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/chat/messages')
          .set(headers)
          .send({ content: 'test' })
      );

      const responses = await Promise.all(requests) as unknown as TestResponse[];
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});