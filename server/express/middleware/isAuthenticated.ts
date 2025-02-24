import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { User } from '../models/User';
import { UserRole, UserStatus, AuthUser, toAuthUser } from '../types/user';
import { AsyncRequestHandler } from '../types/express';

interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const isAuthenticated: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    if (!decoded?.userId) {
      throw new AuthenticationError('Invalid token');
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError(
        user.statusReason || 'Account is suspended'
      );
    }

    // Attach user to request
    req.user = toAuthUser(user);
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware factory for role-based access control
 */
export const requireRole = (allowedRoles: UserRole | UserRole[]): AsyncRequestHandler => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(`Required role: ${roles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Middleware to ensure user email is verified
 */
export const requireVerified: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.isVerified) {
    throw new AuthenticationError('Email verification required');
  }

  next();
};

/**
 * Convenience middleware for common roles
 */
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole([UserRole.ADMIN, UserRole.MODERATOR]);
export const requireSeller = requireRole([UserRole.ADMIN, UserRole.SELLER]);

/**
 * Middleware to ensure user is not suspended
 */
export const requireActive: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.status !== UserStatus.ACTIVE) {
    throw new AuthenticationError('Account is not active');
  }

  next();
};

/**
 * Middleware to ensure user owns the resource
 */
export const requireOwnership = (userIdPath: string): AsyncRequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const resourceUserId = req.params[userIdPath] || req.body[userIdPath];
    if (!resourceUserId) {
      throw new AuthorizationError('Resource owner not found');
    }

    if (resourceUserId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new AuthorizationError('You do not have permission to access this resource');
    }

    next();
  };
};