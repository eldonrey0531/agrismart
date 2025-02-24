import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../middleware/validator";
import { asyncHandler } from "../middleware/asyncHandler";
import { ValidationError, AppError } from "../utils/app-error";

/**
 * Base parameter type
 */
export interface BaseParams {
  [key: string]: string;
}

/**
 * Type-safe request handler
 */
export type RequestHandler<P extends BaseParams = BaseParams, B = any> = (
  req: Request<P, any, B>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

/**
 * Route configuration
 */
export interface RouteOptions<P extends BaseParams = BaseParams, B = any> {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  schema?: {
    body?: z.ZodSchema<B>;
    query?: z.ZodSchema<any>;
    params?: z.ZodSchema<P>;
  };
  handler: RequestHandler<P, B>;
  middleware?: any[];
}

/**
 * Base router class with improved type safety
 */
export abstract class BaseRouter {
  protected router: Router;
  protected prefix: string;
  protected middleware: any[];

  constructor(prefix: string = "", middleware: any[] = []) {
    this.router = Router();
    this.prefix = prefix;
    this.middleware = middleware;
    this.initializeRoutes();
  }

  protected abstract initializeRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }

  protected createRoute<P extends BaseParams = BaseParams, B = any>(
    options: RouteOptions<P, B>
  ): void {
    const { method, path, schema, handler, middleware = [] } = options;

    const routeMiddleware = [
      ...this.middleware,
      ...middleware,
    ];

    if (schema) {
      if (schema.body) {
        routeMiddleware.push(validate(schema.body, { location: "body" }));
      }
      if (schema.query) {
        routeMiddleware.push(validate(schema.query, { location: "query" }));
      }
      if (schema.params) {
        routeMiddleware.push(validate(schema.params, { location: "params" }));
      }
    }

    const wrappedHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const typedReq = req as Request<P, any, B>;
        await Promise.resolve(handler(typedReq, res, next));
      } catch (error) {
        next(this.handleError(error));
      }
    });

    this.router[method](path, ...routeMiddleware, wrappedHandler);
  }

  protected createSubRouter(prefix: string, middleware: any[] = []): Router {
    const subRouter = Router();
    [...this.middleware, ...middleware].forEach((mw) => subRouter.use(mw));
    this.router.use(prefix, subRouter);
    return subRouter;
  }

  protected handleError(error: unknown): AppError {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, curr) => {
        const path = curr.path.join(".");
        if (!acc[path]) acc[path] = [];
        acc[path].push(curr.message);
        return acc;
      }, {} as Record<string, string[]>);
      return new ValidationError("Validation failed", errors);
    }

    if (error instanceof AppError) {
      return error;
    }

    const err = error instanceof Error ? error : new Error(String(error));
    return new AppError(err.message);
  }

  /**
   * Helper to wrap handlers with error handling and type safety
   */
  protected wrapHandler<P extends BaseParams = BaseParams, B = any>(
    handler: RequestHandler<P, B>
  ): RequestHandler<P, B> {
    return async (req, res, next) => {
      try {
        await Promise.resolve(handler(req, res, next));
      } catch (error) {
        next(this.handleError(error));
      }
    };
  }
}

export default BaseRouter;