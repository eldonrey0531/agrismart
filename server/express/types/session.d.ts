import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
    role: string;
    rememberMe?: boolean;
  }
}

// Extend session cookie options
declare module 'express-session' {
  interface SessionOptions {
    cookie?: {
      secure?: boolean;
      maxAge?: number;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
      httpOnly?: boolean;
    };
  }
}

// Augment the Express Request type
declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}