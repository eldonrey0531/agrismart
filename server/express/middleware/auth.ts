import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { UnauthorizedError } from '../utils/app-error';
import { verifyToken } from '../utils/jwt';
import { Role, Status } from '../models/types/Role';
import type { AuthenticatedRequest } from '../types/express';

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const userData = await verifyToken(token);
    req.user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: userData.status
    };
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      next(new UnauthorizedError('Insufficient permissions'));
      return;
    }
    next();
  };
};

// Helper to ensure user is authenticated in route handlers
export const ensureAuthenticated = (
  req: Request
): asserts req is AuthenticatedRequest => {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }
};

// Helper to check active account status
export const requireActiveStatus = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    next(new UnauthorizedError('User not authenticated'));
    return;
  }

  if (req.user.status !== Status.ACTIVE) {
    next(new UnauthorizedError('Account is not active'));
    return;
  }

  next();
};

// Helper to ensure seller verification
export const requireVerifiedSeller = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    next(new UnauthorizedError('User not authenticated'));
    return;
  }

  if (req.user.role !== Role.SELLER) {
    next(new UnauthorizedError('User is not a seller'));
    return;
  }

  if (req.user.status !== Status.ACTIVE) {
    next(new UnauthorizedError('Seller account is not active'));
    return;
  }

  next();
};

export default {
  authenticateUser,
  requireRole,
  ensureAuthenticated,
  requireActiveStatus,
  requireVerifiedSeller
};
