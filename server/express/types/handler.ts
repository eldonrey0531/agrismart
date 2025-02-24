import { Request, Response, NextFunction } from "express";

/**
 * Base request parameters interface
 */
export interface RequestParams extends Record<string, string | undefined> {}

/**
 * Extended request type with generics
 */
export type ExtendedRequest<P = RequestParams, B = any> = Request<P, any, B>;

/**
 * Base request handler type
 */
export type RequestHandler<P = RequestParams, B = any> = (
  req: ExtendedRequest<P, B>,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Route configuration interface
 */
export interface RouteConfig<P = RequestParams, B = any> {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  handler: RequestHandler<P, B>;
  schema?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

/**
 * Base controller interface
 */
export interface BaseController {
  [key: string]: RequestHandler;
}

/**
 * API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Handler wrapper type
 */
export type HandlerWrapper = <P = RequestParams, B = any>(
  handler: RequestHandler<P, B>
) => RequestHandler<P, B>;

/**
 * Controller configuration interface
 */
export interface ControllerConfig {
  basePath: string;
  middleware?: RequestHandler[];
}

/**
 * Router helpers
 */
export const wrapHandler = <P = RequestParams, B = any>(
  handler: (req: ExtendedRequest<P, B>, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler<P, B> => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };
};