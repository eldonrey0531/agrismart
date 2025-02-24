import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { AuthUser, UserDocument, JWTPayload } from '../types';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = validateToken(token) as JWTPayload;

    // Get full user details from database
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean() as UserDocument;

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.sessionVersion !== decoded.sessionVersion) {
      throw new AuthenticationError('Session expired');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      accountLevel: user.accountLevel,
      status: user.status,
      isVerified: user.isVerified,
      sessionVersion: user.sessionVersion,
      lastLoginAt: user.lastLoginAt,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
}