import { describe, it, expect } from '@jest/globals';
import { auth, type AuthError } from '../auth';
import { testMiddleware } from '../../test/errors';
import { testUtils } from '../../test/utils';
import { UserRole } from '../../types/shared';
import { verifyToken } from '../../utils/auth';

// Mock verifyToken
jest.mock('../../utils/auth', () => ({
  verifyToken: jest.fn(),
}));

describe('Auth Middleware', () => {
  describe('required middleware', () => {
    it('passes with valid token', async () => {
      const user = await testUtils.createUser();
      (verifyToken as jest.Mock).mockResolvedValueOnce(user);

      const { next } = await testMiddleware(auth.required, {
        req: {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
      expect(verifyToken).toHaveBeenCalledWith(user.accessToken);
    });

    it('fails without token', async () => {
      await testMiddleware(auth.required, {
        expectedError: {
          status: 401,
          type: 'UNAUTHORIZED',
          message: 'Authentication required',
        } as AuthError,
      });
    });

    it('fails with invalid token', async () => {
      (verifyToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

      await testMiddleware(auth.required, {
        req: {
          headers: {
            authorization: 'Bearer invalid-token',
          },
        },
        expectedError: {
          status: 401,
          type: 'UNAUTHORIZED',
          message: 'Authentication required',
        } as AuthError,
      });
    });
  });

  describe('admin middleware', () => {
    it('passes for admin users', async () => {
      const admin = await testUtils.createAdmin();

      const { next } = await testMiddleware(auth.admin, {
        req: {
          user: {
            ...admin,
            role: UserRole.ADMIN,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
    });

    it('fails for regular users', async () => {
      const user = await testUtils.createUser();

      await testMiddleware(auth.admin, {
        req: {
          user: {
            ...user,
            role: UserRole.USER,
          },
        },
        expectedError: {
          status: 403,
          type: 'FORBIDDEN',
          message: 'Admin access required',
        } as AuthError,
      });
    });

    it('fails without user', async () => {
      await testMiddleware(auth.admin, {
        expectedError: {
          status: 401,
          type: 'UNAUTHORIZED',
          message: 'Authentication required',
        } as AuthError,
      });
    });
  });

  describe('owner middleware', () => {
    const resourceId = 'test-resource-123';

    it('passes for resource owner', async () => {
      const user = await testUtils.createUser();

      const { next } = await testMiddleware(auth.owner(resourceId), {
        req: {
          user: {
            ...user,
            id: resourceId,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
    });

    it('passes for admin users', async () => {
      const admin = await testUtils.createAdmin();

      const { next } = await testMiddleware(auth.owner(resourceId), {
        req: {
          user: {
            ...admin,
            role: UserRole.ADMIN,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
    });

    it('fails for non-owners', async () => {
      const user = await testUtils.createUser();

      await testMiddleware(auth.owner(resourceId), {
        req: {
          user: {
            ...user,
            id: 'different-id',
          },
        },
        expectedError: {
          status: 403,
          type: 'FORBIDDEN',
          message: 'Resource access denied',
        } as AuthError,
      });
    });
  });

  describe('combine middleware', () => {
    it('chains multiple middleware successfully', async () => {
      const admin = await testUtils.createAdmin();
      const combinedMiddleware = auth.combine(
        auth.required,
        auth.admin
      );

      (verifyToken as jest.Mock).mockResolvedValueOnce({
        ...admin,
        role: UserRole.ADMIN,
      });

      const { next } = await testMiddleware(combinedMiddleware, {
        req: {
          headers: {
            authorization: `Bearer ${admin.accessToken}`,
          },
        },
      });

      expect(next).toHaveBeenCalledWith();
    });

    it('stops on first middleware failure', async () => {
      const combinedMiddleware = auth.combine(
        auth.required,
        auth.admin
      );

      await testMiddleware(combinedMiddleware, {
        expectedError: {
          status: 401,
          type: 'UNAUTHORIZED',
          message: 'Authentication required',
        } as AuthError,
      });
    });
  });
});