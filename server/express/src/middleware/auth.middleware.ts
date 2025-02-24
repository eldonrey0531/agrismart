import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/enums';
import { JwtService } from '../services/jwt.service';
import { ApiError } from './error-handler';

export const auth = {
  /**
   * Require authentication for route
   */
  required: (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw ApiError.unauthorized('No token provided');
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw ApiError.unauthorized('Invalid token format');
      }

      const user = JwtService.extractUserDetails(token);
      if (!user) {
        throw ApiError.unauthorized('Invalid token');
      }

      req.authenticatedUser = user;
      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Require specific role(s) for route
   */
  hasRole: (...roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (!req.authenticatedUser) {
          throw ApiError.unauthorized('Authentication required');
        }

        if (!roles.includes(req.authenticatedUser.role)) {
          throw ApiError.forbidden('Insufficient permissions');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * Optional authentication
   * Will set req.authenticatedUser if token is valid, but won't throw if no token
   */
  optional: (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next();
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        return next();
      }

      const user = JwtService.extractUserDetails(token);
      if (user) {
        req.authenticatedUser = user;
      }

      next();
    } catch (error) {
      // Ignore token errors for optional auth
      next();
    }
  },

  /**
   * Check if request is from an admin
   */
  isAdmin: (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.authenticatedUser) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (req.authenticatedUser.role !== Role.ADMIN) {
        throw ApiError.forbidden('Admin access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if request is from a seller
   */
  isSeller: (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.authenticatedUser) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (req.authenticatedUser.role !== Role.SELLER) {
        throw ApiError.forbidden('Seller access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if request is from the resource owner or an admin
   */
  isResourceOwner: (userId: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (!req.authenticatedUser) {
          throw ApiError.unauthorized('Authentication required');
        }

        if (req.authenticatedUser.id !== userId && req.authenticatedUser.role !== Role.ADMIN) {
          throw ApiError.forbidden('Access denied');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
};