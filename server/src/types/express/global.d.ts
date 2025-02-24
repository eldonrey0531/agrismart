import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
      requestId?: string;
      startTime?: number;
    }

    interface Response {
      locals: {
        user?: User;
        requestId?: string;
        [key: string]: any;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File;
    files?: {
      [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[];
  }

  interface ParamsDictionary {
    [key: string]: string;
  }

  interface Query {
    [key: string]: string | string[] | undefined;
  }
}

// Custom route handler types
export type AsyncRequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query> = (
  req: Express.Request<P, ResBody, ReqBody, ReqQuery>,
  res: Express.Response<ResBody>,
  next: Express.NextFunction
) => Promise<void>;

export type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query> = (
  req: Express.Request<P, ResBody, ReqBody, ReqQuery>,
  res: Express.Response<ResBody>,
  next: Express.NextFunction
) => void;

// Request types
export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export interface FileRequest extends Express.Request {
  file: Express.Multer.File;
}

export interface FilesRequest extends Express.Request {
  files: Express.Multer.File[];
}

// Response types
export interface TypedResponse<T> extends Express.Response {
  json(data: T): this;
}

// Middleware types
export type AsyncMiddleware = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => Promise<void>;

export type Middleware = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => void;

// Error handler types
export type ErrorRequestHandler = (
  err: Error,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => void;

// Route configuration types
export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  handler: RequestHandler | AsyncRequestHandler;
  middlewares?: (Middleware | AsyncMiddleware)[];
  auth?: boolean;
  roles?: string[];
}

// Query parameter types
export interface PaginationQuery extends Express.Query {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends Express.Query {
  q?: string;
  filters?: string;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors?: {
    field: string;
    message: string;
  }[];
}

// Route parameter types
export interface IdParam extends Express.ParamsDictionary {
  id: string;
}

// Export for use in other files
export {
  Express,
  RequestHandler,
  AsyncRequestHandler,
  Middleware,
  AsyncMiddleware,
  ErrorRequestHandler,
  RouteConfig,
  PaginationQuery,
  SearchQuery,
  ValidationResult,
  IdParam
};