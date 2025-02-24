import { User } from '@prisma/client';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
      requestId?: string;
      startTime?: number;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }

    interface Response extends ExpressResponse {
      locals: {
        user?: User;
        [key: string]: any;
      };
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
        url?: string;
        key?: string;
      }
    }
  }

  // Common type augmentations
  interface Error {
    status?: number;
    code?: string;
    details?: Record<string, any>;
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRY: string;
      AWS_S3_BUCKET?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_FROM: string;
      [key: string]: string | undefined;
    }
  }
}

// Custom type declarations
declare module 'express-serve-static-core' {
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
      [key: string]: any;
    };
  }

  interface ParamsDictionary {
    [key: string]: string;
  }

  interface Query {
    [key: string]: undefined | string | string[] | Query | Query[];
  }
}

// Utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

// Export custom types
export {
  User,
  ExpressRequest as Request,
  ExpressResponse as Response,
  Nullable,
  Optional,
  DeepPartial,
  AsyncFunction
};