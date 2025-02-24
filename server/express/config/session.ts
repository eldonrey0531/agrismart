import session from 'express-session';
import MongoStore from 'connect-mongo';
import { prisma } from '../utils/prisma';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    ttl: THIRTY_DAYS / 1000, // MongoDB expects seconds
    autoRemove: 'native', // Use MongoDB's TTL index
    touchAfter: 24 * 3600 // Update session only once per 24h unless data changes
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: THIRTY_DAYS,
    sameSite: 'lax' as const
  },
  name: 'sid', // Change session cookie name from default 'connect.sid'
  rolling: true, // Reset maxAge on every response
};

// Add type safety for session data
declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
    role: string;
    rememberMe?: boolean;
  }
}

// Session utilities
export const sessionUtils = {
  /**
   * Create a new session
   */
  async createSession(req: Express.Request, user: { id: string; email: string; role: string }, rememberMe?: boolean) {
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.rememberMe = rememberMe;

    if (!rememberMe) {
      // Override cookie maxAge for non-remembered sessions
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  },

  /**
   * Destroy session
   */
  async destroySession(req: Express.Request) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  },

  /**
   * Extend session if remember me is enabled
   */
  extendSession(req: Express.Request) {
    if (req.session.rememberMe) {
      req.session.cookie.maxAge = THIRTY_DAYS;
    }
  }
};