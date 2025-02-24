import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthController } from '../auth.controller';
import { AuthServiceError } from '../../services/auth.service';
import { testUtils } from './test-utils';

describe('AuthController', () => {
  const mockUser = testUtils.mockData.user;
  const mockToken = testUtils.mockData.token;
  let authService = testUtils.createMockAuthService();
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = testUtils.createMockAuthService();
    controller = new AuthController(authService);
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'ValidPass123',
    };

    it('handles successful login', async () => {
      const req = testUtils.createMockRequest({ body: validCredentials });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      authService.verifyCredentials.mockResolvedValueOnce(mockUser);
      authService.generateToken.mockReturnValueOnce(mockToken);

      await controller.login(req, res, next);

      testUtils.responseMatchers.toHaveSuccessResponse(res, {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        token: mockToken,
      });
    });

    it('handles validation errors', async () => {
      const req = testUtils.createMockRequest({
        body: { email: 'invalid-email', password: '' },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      await controller.login(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 400,
        type: 'VALIDATION_ERROR',
      });
    });

    it('handles authentication errors', async () => {
      const req = testUtils.createMockRequest({ body: validCredentials });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      authService.verifyCredentials.mockRejectedValueOnce(
        AuthServiceError.invalidCredentials()
      );

      await controller.login(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 401,
        type: 'INVALID_CREDENTIALS',
      });
    });
  });

  describe('signup', () => {
    const validSignup = {
      email: 'new@example.com',
      password: 'ValidPass123',
    };

    it('handles successful signup', async () => {
      const req = testUtils.createMockRequest({ body: validSignup });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      authService.createUser.mockResolvedValueOnce(mockUser);
      authService.generateToken.mockReturnValueOnce(mockToken);

      await controller.signup(req, res, next);

      testUtils.responseMatchers.toHaveSuccessResponse(
        res,
        {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          },
          token: mockToken,
        },
        201
      );
    });

    it('handles validation errors', async () => {
      const req = testUtils.createMockRequest({
        body: { email: 'invalid-email', password: 'short' },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      await controller.signup(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 400,
        type: 'VALIDATION_ERROR',
      });
    });
  });

  describe('me', () => {
    it('returns authenticated user', async () => {
      const req = testUtils.createMockRequest({ user: mockUser });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      await controller.me(req, res, next);

      testUtils.responseMatchers.toHaveSuccessResponse(res, {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('handles unauthenticated request', async () => {
      const req = testUtils.createMockRequest();
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      await controller.me(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 401,
        type: 'UNAUTHORIZED',
      });
    });
  });

  describe('validateToken', () => {
    it('validates token and sets user', async () => {
      const req = testUtils.createMockRequest({
        headers: { authorization: `Bearer ${mockToken}` },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      authService.verifyToken.mockResolvedValueOnce(mockUser);

      await controller.validateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('handles missing token', async () => {
      const req = testUtils.createMockRequest();
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      await controller.validateToken(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 401,
        type: 'UNAUTHORIZED',
      });
    });

    it('handles invalid token', async () => {
      const req = testUtils.createMockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      authService.verifyToken.mockRejectedValueOnce(
        AuthServiceError.invalidToken()
      );

      await controller.validateToken(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 401,
        type: 'INVALID_TOKEN',
      });
    });
  });

  describe('requireAdmin', () => {
    const adminUser = testUtils.mockData.admin;

    it('allows admin access', () => {
      const req = testUtils.createMockRequest({ user: adminUser });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      controller.requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects non-admin users', () => {
      const req = testUtils.createMockRequest({ user: mockUser });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      controller.requireAdmin(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 403,
        type: 'FORBIDDEN',
        message: 'Admin access required',
      });
    });

    it('rejects unauthenticated requests', () => {
      const req = testUtils.createMockRequest();
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      controller.requireAdmin(req, res, next);

      testUtils.responseMatchers.toHaveErrorResponse(next, {
        status: 403,
        type: 'FORBIDDEN',
        message: 'Admin access required',
      });
    });
  });
});