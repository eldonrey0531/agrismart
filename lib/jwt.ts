import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/lib/config/auth';
import { AUTH, ERROR_MESSAGES } from '@/lib/constants';
import { ApiException } from '@/lib/utils/error-handler';

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accountLevel?: string;
}

export interface JwtPayload extends jwt.JwtPayload {
  user: JwtUser;
}

// Convert time string (e.g., '7d') to seconds for jwt.sign
function parseExpiryTime(time: string): number {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1));

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60; // Default to 7 days
  }
}

const JWT_SIGN_OPTIONS: SignOptions = {
  algorithm: 'HS256',
  expiresIn: parseExpiryTime(AUTH_CONFIG.jwtExpiryTime),
};

const JWT_VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ['HS256'],
};

/**
 * Sign a new JWT token
 */
export function signToken(user: JwtUser): string {
  try {
    if (!AUTH_CONFIG.jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
      { user },
      AUTH_CONFIG.jwtSecret,
      JWT_SIGN_OPTIONS
    );
  } catch (error) {
    console.error('JWT sign error:', error);
    throw new ApiException(ERROR_MESSAGES.SERVER);
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    if (!AUTH_CONFIG.jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(
      token,
      AUTH_CONFIG.jwtSecret,
      JWT_VERIFY_OPTIONS
    ) as JwtPayload;

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      throw new ApiException(
        ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
        401
      );
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiException(
        ERROR_MESSAGES.AUTH.INVALID_TOKEN,
        401
      );
    }

    console.error('JWT verify error:', error);
    throw new ApiException(ERROR_MESSAGES.SERVER);
  }
}

/**
 * Decode a JWT token without verification
 * Useful for debugging or getting payload info without verification
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Check if a token is valid and not expired
 */
export function isValidToken(token: string): boolean {
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the expiration time of a token
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate remaining time until token expiration in seconds
 */
export function getTokenTimeRemaining(token: string): number {
  const exp = getTokenExpiration(token);
  if (!exp) return 0;
  
  const now = new Date();
  return Math.max(0, Math.floor((exp.getTime() - now.getTime()) / 1000));
}

/**
 * Check if a token needs to be refreshed (e.g., if close to expiration)
 */
export function shouldRefreshToken(token: string, thresholdSeconds: number = 300): boolean {
  return getTokenTimeRemaining(token) <= thresholdSeconds;
}