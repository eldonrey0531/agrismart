import { Router, Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validate } from '../middleware/validator';
import {
  BaseParams,
  TypedRequest,
  TypedResponse,
  ApiResponse,
  RouteDefinition,
  HttpMethod,
} from '../types/common';

export abstract class BaseRouter {
  protected router: Router;
  private prefix: string;
  private middleware: any[];

  constructor(prefix: string = "", middleware: any[] = []) {
    this.router = Router();
    this.prefix = prefix;
    this.middleware = middleware;

    // Apply base middleware
    this.middleware.forEach(mw => this.router.use(mw));
    
    // Initialize routes
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }

  protected createRoute<P extends BaseParams = BaseParams, B = any>(
    options: RouteDefinition<P, B>
  ): void {
    const { method, path, handler, schema, middleware = [] } = options;

    const routeMiddleware = [
      ...middleware,
      ...(schema ? this.createValidationMiddleware(schema) : []),
    ];

    const wrappedHandler = this.wrapHandler(handler);
    
    this.router[method](path, ...routeMiddleware, wrappedHandler);
  }

  protected createValidationMiddleware(schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  }) {
    const middleware: any[] = [];

    if (schema.body) {
      middleware.push(validate(schema.body, { location: 'body' }));
    }
    if (schema.query) {
      middleware.push(validate(schema.query, { location: 'query' }));
    }
    if (schema.params) {
      middleware.push(validate(schema.params, { location: 'params' }));
    }

    return middleware;
  }

  protected wrapHandler<P extends BaseParams = BaseParams, B = any>(
    handler: (
      req: TypedRequest<P, B>,
      res: TypedResponse,
      next: NextFunction
    ) => Promise<void>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req as TypedRequest<P, B>, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  protected sendResponse<T>(res: Response, data: ApiResponse<T>): void {
    res.json(data);
  }

  protected createSubRouter(prefix: string, middleware: any[] = []): Router {
    const subRouter = Router();
    [...this.middleware, ...middleware].forEach(mw => subRouter.use(mw));
    this.router.use(prefix, subRouter);
    return subRouter;
  }
}

export default BaseRouter;