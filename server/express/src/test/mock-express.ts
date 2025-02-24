import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import type { Server } from 'http';
import type { SuperTest, Test } from 'supertest';
import supertest from 'supertest';
import { errorHandler } from '../middleware/error';
import { testUtils } from './utils';
import type { User, UserRole } from '@prisma/client';
import type {
  TestRequest,
  TestResponse,
  SuccessResponse,
  ErrorResponse,
} from './types';

/**
 * Express app configuration
 */
interface AppConfig {
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  errorHandler?: boolean;
  locals?: Record<string, any>;
}

/**
 * Create test Express app
 */
export function createTestApp(config: AppConfig = {}): Express {
  const app = express();
  app.use(express.json());

  // Add custom locals
  if (config.locals) {
    app.locals = {
      ...app.locals,
      ...config.locals,
    };
  }

  // Add custom middleware
  if (config.middleware) {
    config.middleware.forEach(middleware => app.use(middleware));
  }

  // Add error handler
  if (config.errorHandler !== false) {
    app.use(errorHandler);
  }

  return app;
}

/**
 * Test server manager
 */
export class TestServer {
  private server: Server | null = null;
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(0, () => resolve());
    });
  }

  /**
   * Stop server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get supertest instance
   */
  request(): SuperTest<Test> {
    return supertest(this.app);
  }
}

/**
 * Mock middleware factory
 */
export const mockMiddleware = {
  /**
   * Create auth middleware
   */
  auth: (user: User = testUtils.testData.user.basic) => {
    return (req: TestRequest, _: Response, next: NextFunction) => {
      req.user = user;
      next();
    };
  },

  /**
   * Create admin middleware
   */
  admin: () => {
    const adminUser = {
      ...testUtils.testData.user.admin,
      role: 'ADMIN' as UserRole,
    };
    return mockMiddleware.auth(adminUser);
  },

  /**
   * Create error middleware
   */
  error: (error: Error) => {
    return (_: Request, __: Response, next: NextFunction) => {
      next(error);
    };
  },

  /**
   * Create validation middleware
   */
  validate: (schema: { parse: (data: unknown) => unknown }) => {
    return (req: Request, _: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * Create mock service middleware
   */
  service: <T>(name: string, service: T) => {
    return (req: Request, _: Response, next: NextFunction) => {
      req.app.locals[name] = service;
      next();
    };
  },
};

/**
 * Test response assertions
 */
export const assertions = {
  /**
   * Assert successful response
   */
  isSuccessResponse: <T = unknown>(response: TestResponse, status = 200): T => {
    expect(response.status).toBe(status);
    expect(response.body).toEqual(
      expect.objectContaining<Partial<SuccessResponse>>({
        success: true,
      })
    );
    return response.body.data as T;
  },

  /**
   * Assert error response
   */
  isErrorResponse: (response: TestResponse, status: number, type: string): ErrorResponse => {
    expect(response.status).toBe(status);
    expect(response.body).toEqual(
      expect.objectContaining<Partial<ErrorResponse>>({
        success: false,
        type,
      })
    );
    return response.body as ErrorResponse;
  },
};

export const expressTestUtils = {
  createTestApp,
  TestServer,
  mockMiddleware,
  assertions,
};

export type { TestRequest };
export default expressTestUtils;