import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { AuthenticatedUser } from '../types/user';

// Add debug logging
const debug = require('debug')('app:auth');

// List of paths that should be public (with API prefix)
const PUBLIC_PATHS = [
  '/api/v1',              // API root
  '/api/v1/health',       // Health check
  '/api/v1/status',       // System status
  '/api/v1/admin',        // Admin base info
  '/api/v1/analytics',    // Analytics base info
  '/api/v1/moderation',   // Moderation base info
  '/api/v1/products',     // Products base info
  '/api/v1/marketplace',  // Marketplace base info
  '/api/v1/auth/login',   // Auth endpoints
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  '/api/v1/docs'          // Documentation
];

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.path;
    debug(`Auth middleware checking path: ${path}`);
    
    // Check if path is in public paths list
    if (PUBLIC_PATHS.includes(path)) {
      debug(`Public path detected: ${path}`);
      return next();
    }

    // Check if it's a root-level API path
    if (path.match(/^\/api\/v1\/[^\/]+\/?$/)) {
      debug(`Root-level API path detected: ${path}`);
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      debug('No valid auth header found');
      throw new AppError('Authentication required', 'AUTHENTICATION_ERROR', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      debug('No token found in auth header');
      throw new AppError('Invalid token format', 'AUTHENTICATION_ERROR', 401);
    }

    debug('Verifying token...');
    const decoded = verifyToken(token);
    debug('Token payload:', decoded);

    // Create authenticated user from token data
    const authenticatedUser: AuthenticatedUser = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.role === 'admin' ? 'Admin User' : 'Regular User',
      accountLevel: decoded.role === 'admin' ? 'admin' as const : 'basic' as const,
      status: 'active' as const,
      sessionVersion: decoded.sessionVersion,
      isVerified: true,
      activeSessions: [],
      lastLoginAt: new Date()
    };

    debug('Attaching user to request:', authenticatedUser);
    req.user = authenticatedUser;

    // For admin routes, check if user has admin role
    if (path.startsWith('/api/v1/admin/') && authenticatedUser.role !== 'admin') {
      debug('Non-admin user attempting to access admin route');
      throw new AppError('Admin access required', 'AUTHORIZATION_ERROR', 403);
    }

    debug('Authentication successful');
    next();
  } catch (error) {
    debug('Authentication error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTHENTICATION_ERROR'
        }
      });
    }
  }
};