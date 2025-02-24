import { describe, it, expect } from '@jest/globals';
import { testUtils } from '../utils';
import { testMiddleware, assertError, createError } from '../errors';
import { auth } from '../../middleware/auth';
import type { TestResponse } from '../../types/test';
import type { Request, Response } from 'express';

interface AuthTestData {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

describe('Auth Test Examples', () => {
  describe('User Creation', () => {
    it('creates a regular user', async () => {
      const user = await testUtils.createUser({
        email: 'test@example.com',
        password: 'Test123!',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.accessToken).toBeDefined();
      expect(user.rawPassword).toBe('Test123!');
    });

    it('creates an admin user', async () => {
      const admin = await testUtils.createAdmin({
        email: 'admin@example.com',
      });

      expect(admin.role).toBe('ADMIN');
      expect(admin.accessToken).toBeDefined();
    });
  });

  describe('Auth Middleware', () => {
    it('allows authenticated requests', async () => {
      const user = await testUtils.createUser();
      
      const { next } = await testMiddleware(auth.required, {
        req: {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
      expect(next.mock.calls[0][0]).toBeUndefined();
    });

    it('rejects unauthenticated requests', async () => {
      await testMiddleware(auth.required, {
        expectedError: {
          status: 401,
          type: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    it('restricts admin routes for regular users', async () => {
      const user = await testUtils.createUser();
      
      await testMiddleware(auth.admin, {
        req: {
          user: {
            id: user.id,
            email: user.email,
            role: 'USER',
          },
        },
        expectedError: {
          status: 403,
          type: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
    });

    it('allows admin access to admin routes', async () => {
      const admin = await testUtils.createAdmin();
      
      const { next } = await testMiddleware(auth.admin, {
        req: {
          user: {
            id: admin.id,
            email: admin.email,
            role: 'ADMIN',
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
      expect(next.mock.calls[0][0]).toBeUndefined();
    });

    it('checks resource ownership', async () => {
      const user = await testUtils.createUser();
      const otherUser = await testUtils.createUser();
      
      // Owner can access their resource
      const { next: ownerNext } = await testMiddleware(auth.owner(user.id), {
        req: {
          user: {
            id: user.id,
            email: user.email,
            role: 'USER',
          },
        },
      });

      expect(ownerNext).toHaveBeenCalledWith();

      // Non-owner cannot access
      await testMiddleware(auth.owner(user.id), {
        req: {
          user: {
            id: otherUser.id,
            email: otherUser.email,
            role: 'USER',
          },
        },
        expectedError: {
          status: 403,
          type: 'FORBIDDEN',
          message: 'Resource access denied',
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('handles validation errors', async () => {
      const response = {
        status: 400,
        body: {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          errors: [
            { path: 'email', message: 'Invalid email format' },
          ],
        },
      } as TestResponse;

      assertError(response, {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
      });
    });

    it('creates test errors', () => {
      const error = createError({
        status: 404,
        type: 'NOT_FOUND',
        message: 'User not found',
        data: { id: '123' },
      });

      expect(error.status).toBe(404);
      expect(error.type).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
      expect(error.data).toEqual({ id: '123' });
    });
  });

  describe('API Response Handling', () => {
    const mockHandler = async (req: Request, res: Response) => {
      const user = await testUtils.createUser();
      return {
        status: 200,
        body: {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
            },
            token: user.accessToken,
          },
        },
      } as TestResponse;
    };

    it('handles successful responses', async () => {
      const response = await mockHandler({} as Request, {} as Response);
      const data = testUtils.success<AuthTestData>(response);

      expect(data.user.id).toBeDefined();
      expect(data.token).toBeDefined();
    });
  });
});