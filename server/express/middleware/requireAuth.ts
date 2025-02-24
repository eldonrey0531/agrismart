import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { authConfig } from '../config/auth';
import { UserRole } from '../types/user';
import { AsyncRequestHandler } from '../types/express';
import { isAuthenticated } from './isAuthenticated';

/**
 * Check if a role has permission based on role hierarchy
 */
const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  if (userRole === requiredRole) return true;
  return authConfig.rbac.roleHierarchy[userRole]?.includes(requiredRole) || false;
};

/**
 * Check if a path requires specific roles
 */
const getRequiredRolesForPath = (path: string): UserRole[] | null => {
  for (const [pattern, roles] of Object.entries(authConfig.rbac.restrictedPaths)) {
    const regexPattern = pattern.replace('*', '.*');
    if (new RegExp(`^${regexPattern}$`).test(path)) {
      return roles;
    }
  }
  return null;
};

/**
 * Enhanced authentication middleware with role-based access control
 */
export const requireAuth = (requiredRoles?: UserRole | UserRole[]): AsyncRequestHandler => {
  const roles = requiredRoles ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]) : null;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First, ensure the user is authenticated
      await isAuthenticated(req, res, () => {});

      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check path-based restrictions
      const pathRoles = getRequiredRolesForPath(req.path);
      if (pathRoles) {
        const hasPathPermission = pathRoles.some(role => 
          hasPermission(req.user!.role, role)
        );
        if (!hasPathPermission) {
          throw new AuthorizationError('Insufficient permissions for this path');
        }
      }

      // Check explicit role requirements
      if (roles) {
        const hasRolePermission = roles.some(role => 
          hasPermission(req.user!.role, role)
        );
        if (!hasRolePermission) {
          throw new AuthorizationError('Insufficient permissions');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to ensure user is verified
 */
export const requireVerified: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.isVerified && authConfig.features.emailVerification) {
    throw new AuthenticationError('Email verification required');
  }

  next();
};

/**
 * Middleware to ensure user's password is not expired
 */
export const requireValidPassword: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (authConfig.features.passwordExpiration) {
    const user = req.user as any; // TODO: Add proper typing
    if (user.isPasswordExpired?.()) {
      throw new AuthenticationError('Password has expired. Please reset your password.');
    }
  }

  next();
};

/**
 * Middleware to ensure session is valid
 */
export const validateSession: AsyncRequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (authConfig.features.sessionRevalidation) {
    // TODO: Implement session revalidation logic
    // This could include checking if the user's status has changed,
    // if their permissions have been revoked, etc.
  }

  next();
};

/**
 * Convenience middleware combinations
 */
export const requireAuthAndVerified = [requireAuth(), requireVerified];
export const requireAuthAndValidPassword = [requireAuth(), requireValidPassword];
export const requireAdmin = [requireAuth([UserRole.ADMIN]), requireVerified];
export const requireModerator = [requireAuth([UserRole.ADMIN, UserRole.MODERATOR]), requireVerified];
export const requireSeller = [requireAuth([UserRole.ADMIN, UserRole.SELLER]), requireVerified];