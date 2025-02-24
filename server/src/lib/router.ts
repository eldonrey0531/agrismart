import { Router as ExpressRouter, RequestHandler, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ResponseHandler } from '../utils/response-handler';
import { ValidationService } from './validation';

interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  validate?: z.ZodSchema;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
}

interface RouteGroup {
  prefix: string;
  middlewares?: RequestHandler[];
  routes: RouteConfig[];
}

export class Router {
  private router: ExpressRouter;

  constructor() {
    this.router = ExpressRouter();
  }

  private wrapHandler(handler: RequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await Promise.resolve(handler(req, res, next));
      } catch (error) {
        ResponseHandler.serverError(res, error as Error);
      }
    };
  }

  private addRoute(config: RouteConfig): void {
    const { method, path, validate, middlewares = [], handler } = config;
    const handlers: RequestHandler[] = [];

    // Add validation middleware if schema is provided
    if (validate) {
      handlers.push(ValidationService.validate(validate));
    }

    // Add custom middlewares
    handlers.push(...middlewares);

    // Add wrapped handler
    handlers.push(this.wrapHandler(handler));

    // Add route to router
    this.router[method](path, ...handlers);
  }

  route(config: RouteConfig): Router {
    this.addRoute(config);
    return this;
  }

  group(config: RouteGroup): Router {
    const { prefix, middlewares = [], routes } = config;
    const subRouter = ExpressRouter();

    // Apply group middlewares
    if (middlewares.length > 0) {
      subRouter.use(...middlewares);
    }

    // Add routes to sub-router
    routes.forEach(route => {
      const handlers: RequestHandler[] = [];

      if (route.validate) {
        handlers.push(ValidationService.validate(route.validate));
      }

      if (route.middlewares) {
        handlers.push(...route.middlewares);
      }

      handlers.push(this.wrapHandler(route.handler));

      subRouter[route.method](route.path, ...handlers);
    });

    // Mount sub-router
    this.router.use(prefix, subRouter);

    return this;
  }

  middleware(handler: RequestHandler): Router {
    this.router.use(handler);
    return this;
  }

  getRouter(): ExpressRouter {
    return this.router;
  }
}

// Example usage:
/*
const router = new Router();

// Single route
router.route({
  method: 'post',
  path: '/login',
  validate: ValidationService.loginSchema,
  handler: authController.login
});

// Route group
router.group({
  prefix: '/users',
  middlewares: [authMiddleware],
  routes: [
    {
      method: 'get',
      path: '/',
      handler: userController.getUsers
    },
    {
      method: 'post',
      path: '/',
      validate: ValidationService.createUserSchema,
      handler: userController.createUser
    }
  ]
});

export default router.getRouter();
*/

// Type-safe route handler creator
export function createHandler<T = any>(
  handler: (req: Request & { validatedData?: T }, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}