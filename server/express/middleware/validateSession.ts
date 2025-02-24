import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/SessionService';
import { AsyncRequestHandler } from '../types/express';
import { AuthenticationError } from '../utils/errors';
import { authConfig } from '../config/auth';
import { UserDocument, isUserDocument } from '../types/user';

interface ValidationOptions {
  /**
   * Whether to update the last activity timestamp
   */
  updateActivity?: boolean;

  /**
   * Whether to check session version
   */
  checkVersion?: boolean;

  /**
   * Whether to validate session expiry
   */
  checkExpiry?: boolean;

  /**
   * Whether to validate password expiry
   */
  checkPasswordExpiry?: boolean;
}

const defaultOptions: ValidationOptions = {
  updateActivity: true,
  checkVersion: true,
  checkExpiry: true,
  checkPasswordExpiry: authConfig.features.passwordExpiration,
};

/**
 * Check if session is valid based on activity timestamp
 */
function isSessionActive(user: UserDocument): boolean {
  if (!user.lastActivity) {
    return false;
  }

  const sessionTTL = authConfig.session.ttl * 1000; // Convert to milliseconds
  const expirationTime = new Date(user.lastActivity.getTime() + sessionTTL);
  return new Date() <= expirationTime;
}

/**
 * Middleware to validate user session
 */
export const validateSession = (
  options: ValidationOptions = defaultOptions
): AsyncRequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AuthenticationError('Authentication required');
      }

      // Full session validation through SessionService
      await sessionService.validateSession(req.user.id);

      // Update last activity if enabled
      if (options.updateActivity) {
        await sessionService.updateLastActivity(req.user.id);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to validate and update session activity
 */
export const trackSessionActivity: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.id) {
      await sessionService.updateLastActivity(req.user.id);
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure session is active
 */
export const requireActiveSession = (
  options: ValidationOptions = defaultOptions
): AsyncRequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AuthenticationError('Authentication required');
      }

      // Get session ID from request
      const sessionId = req.headers['x-session-id'] as string;
      if (options.checkVersion && !sessionId) {
        throw new AuthenticationError('Session ID required');
      }

      // Validate session
      if (options.checkVersion && !(await sessionService.isValidSession(req.user.id, sessionId))) {
        throw new AuthenticationError('Session is no longer valid');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to enforce session expiry
 */
export const enforceSessionExpiry: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.id || !isUserDocument(user)) {
      throw new AuthenticationError('Authentication required');
    }

    if (!isSessionActive(user)) {
      throw new AuthenticationError('Session has expired');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Combine common session validations
 */
export const requireValidSession = [
  validateSession(),
  requireActiveSession(),
  enforceSessionExpiry,
];