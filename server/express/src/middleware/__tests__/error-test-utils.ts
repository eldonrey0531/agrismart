import type { Request, Response } from 'express';
import { AuthServiceError } from '../../services/auth.service';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError, z } from 'zod';

/**
 * Types
 */
interface ErrorResponseBody {
  success: false;
  type: string;
  message: string;
  data?: Record<string, any>;
  errors?: any[];
}

interface ExpectedError {
  status: number;
  type: string;
  message?: string;
  data?: Record<string, any>;
}

/**
 * Mock response factory
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};

/**
 * Error matchers
 */
const errorMatchers = {
  /**
   * Assert error response format
   */
  toMatchErrorResponse: (
    res: jest.Mocked<Response>,
    expected: ExpectedError
  ) => {
    expect(res.status).toHaveBeenCalledWith(expected.status);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      type: expected.type,
      ...(expected.message && { message: expected.message }),
      ...(expected.data && { data: expected.data }),
    });
  },
};

/**
 * Error factories
 */
const createTestError = {
  /**
   * Create auth error
   */
  auth: (status: number, type: string, message: string, data?: Record<string, any>) => {
    return new AuthServiceError(status, message, type, data);
  },

  /**
   * Create Prisma unique constraint error
   */
  prismaUnique: (target: string[]) => {
    return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '1.0.0',
      meta: { target },
    });
  },

  /**
   * Create Prisma not found error
   */
  prismaNotFound: () => {
    return new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '1.0.0',
      meta: undefined,
    });
  },

  /**
   * Create Prisma validation error
   */
  prismaValidation: () => {
    return new Prisma.PrismaClientValidationError(
      'Invalid data',
      { clientVersion: '1.0.0' }
    );
  },

  /**
   * Create JWT invalid error
   */
  jwtInvalid: () => {
    return new JsonWebTokenError('invalid signature');
  },

  /**
   * Create JWT expired error
   */
  jwtExpired: () => {
    return new TokenExpiredError('jwt expired', new Date());
  },

  /**
   * Create Zod validation error
   */
  zodValidation: () => {
    const schema = z.object({
      email: z.string().email(),
    });

    try {
      schema.parse({ email: 'invalid' });
      throw new Error('Expected ZodError to be thrown');
    } catch (err) {
      if (err instanceof ZodError) {
        return err;
      }
      throw err;
    }
  },
};

/**
 * Environment utilities
 */
const env = {
  /**
   * Set development environment
   */
  setDevelopment: () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    return () => {
      process.env.NODE_ENV = oldEnv;
    };
  },

  /**
   * Set production environment
   */
  setProduction: () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    return () => {
      process.env.NODE_ENV = oldEnv;
    };
  },
};

/**
 * Test utilities export
 */
const errorTestUtils = {
  createMockResponse,
  errorMatchers,
  createTestError,
  env,
};

export type { ErrorResponseBody, ExpectedError };
export { errorTestUtils };
export default errorTestUtils;