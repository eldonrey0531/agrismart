import { AuthUser } from '@/server/express/types/user';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
      sessionId?: string;
      deviceInfo?: {
        userAgent?: string;
        ip?: string;
        fingerprint?: string;
      };
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRATION: string;
      JWT_REFRESH_EXPIRATION: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_FROM: string;
      REDIS_URL: string;
      CORS_ORIGIN: string;
      API_URL: string;
      FRONTEND_URL: string;
    }
  }

  interface JWTPayload extends JwtPayload {
    userId: string;
    role: string;
    email: string;
    isVerified: boolean;
  }

  interface Window {
    ENV: {
      API_URL: string;
      FRONTEND_URL: string;
      NODE_ENV: string;
    };
  }
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Error class extensions
interface Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

// API Response types
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  code?: string;
}

// Route handler types
type AsyncHandler<T = any> = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => Promise<T>;

type SyncHandler<T = any> = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => T;

type RequestHandler<T = any> = AsyncHandler<T> | SyncHandler<T>;

// Export empty object to make this a module
export {};