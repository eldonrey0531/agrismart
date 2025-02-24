import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { type Request } from 'express';
import { createAuthRouter } from '../auth.routes';
import { testUtils } from '../../test/utils';
import { errorHandler } from '../../middleware/error';
import type { User } from '@prisma/client';

describe('Auth Routes', () => {
  const app = express();
  const mockUser = testUtils.testData.user.basic;
  const mockAdmin = testUtils.testData.user.admin;
  const { valid: mockToken } = testUtils.testData.tokens;
  const { valid: validCredentials } = testUtils.testData.credentials;
  
  let mockAuthService: ReturnType<typeof testUtils.mocks.authService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = testUtils.mocks.authService();

    // Setup test app
    app.use(express.json());
    app.use((req: Request, _, next) => {
      // Inject mock auth service
      req.app.locals.authService = mockAuthService;
      next();
    });
    app.use('/api/auth', createAuthRouter());
    app.use(errorHandler);
  });

  describe('POST /api/auth/login', () => {
    it('returns token on successful login', async () => {
      mockAuthService.verifyCredentials.mockResolvedValueOnce(mockUser);
      mockAuthService.generateToken.mockReturnValueOnce(mockToken);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          token: mockToken,
        },
      });
    });

    it('returns 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          type: 'VALIDATION_ERROR',
        })
      );
    });

    it('returns 401 for invalid credentials', async () => {
      mockAuthService.verifyCredentials.mockRejectedValueOnce(
        testUtils.errors.auth(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    });
  });

  describe('POST /api/auth/signup', () => {
    it('creates new user and returns token', async () => {
      mockAuthService.createUser.mockResolvedValueOnce(mockUser);
      mockAuthService.generateToken.mockReturnValueOnce(mockToken);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validCredentials)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          token: mockToken,
        },
      });
    });

    it('returns 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'invalid-email', password: 'short' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          type: 'VALIDATION_ERROR',
        })
      );
    });

    it('returns 409 for existing email', async () => {
      mockAuthService.createUser.mockRejectedValueOnce(
        testUtils.errors.auth(409, 'EMAIL_EXISTS', 'Email already exists')
      );

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validCredentials)
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        type: 'EMAIL_EXISTS',
        message: 'Email already exists',
      });
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user data for authenticated request', async () => {
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('returns 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        type: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    });
  });

  describe('GET /api/auth/admin', () => {
    it('allows admin access', async () => {
      mockAuthService.verifyToken.mockResolvedValueOnce(mockAdmin);

      const response = await request(app)
        .get('/api/auth/admin')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Admin access granted',
        },
      });
    });

    it('returns 403 for non-admin users', async () => {
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .get('/api/auth/admin')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        type: 'FORBIDDEN',
        message: 'Admin access required',
      });
    });
  });
});