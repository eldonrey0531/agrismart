import mongoose from 'mongoose';
import { createMockRequest } from '../utils/mockRequest';
import createMockResponse from '../utils/mockResponse';
import TestFactory from '../utils/factories';
import { signJWT } from '../../utils/jwt';
import { auth, requireRole, requireOwnership } from '../../middleware/auth';
import type { Response, NextFunction } from 'express';

describe('Authentication Middleware', () => {
  beforeEach(async () => {
    await TestFactory.cleanup();
  });

  describe('auth middleware', () => {
    test('should authenticate with valid token', async () => {
      const user = await TestFactory.createUser({
        role: 'user',
        status: 'active',
      });

      const token = await signJWT({ userId: user._id.toString() });
      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe(user._id.toString());
      expect(req.user?.role).toBe('user');
      expect(req.user?.status).toBe('active');
    });

    test('should reject requests without token', async () => {
      const req = createMockRequest({});
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('required'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid tokens', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    test('should allow user with correct role', () => {
      const req = createMockRequest({
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          role: 'admin',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireRole('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should allow user with any of the specified roles', () => {
      const req = createMockRequest({
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          role: 'seller',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireRole(['admin', 'seller'])(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject user with incorrect role', () => {
      const req = createMockRequest({
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          role: 'user',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireRole('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnership middleware', () => {
    test('should allow resource owner', () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const req = createMockRequest({
        user: {
          id: userId,
          role: 'user',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireOwnership(() => userId)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should allow admin to access any resource', () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const resourceId = new mongoose.Types.ObjectId().toString();
      const req = createMockRequest({
        user: {
          id: userId,
          role: 'admin',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireOwnership(() => resourceId)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should reject non-owner non-admin users', () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const resourceId = new mongoose.Types.ObjectId().toString();
      const req = createMockRequest({
        user: {
          id: userId,
          role: 'user',
          status: 'active',
        },
      });
      const res = createMockResponse() as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireOwnership(() => resourceId)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});