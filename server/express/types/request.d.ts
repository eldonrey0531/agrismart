import { Request } from 'express';
import { Session } from 'express-session';
import { AuthUser } from './auth';

// Base session data
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  rememberMe?: boolean;
}

// Custom session that includes our data
export interface CustomSession extends Session, SessionData {}

// Request with optional session (for all routes)
export interface AppRequest extends Request {
  session: CustomSession;
}

// Request with authenticated session (for protected routes)
export interface AuthRequest extends AppRequest {
  user: AuthUser;
}

// Handler types for easier usage
export type RequestHandler = (
  req: AppRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type AuthHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;