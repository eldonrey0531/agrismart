import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { AuthError } from '../middleware/error-handler';
import { TokenPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SALT_ROUNDS = 10;

/**
 * Generate a JWT token
 */
export function generateToken(payload: Omit<TokenPayload, 'type'>): string {
  try {
    const signOptions = {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, signOptions);
  } catch (error) {
    throw new AuthError('Failed to generate token', 500);
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
      throw new AuthError('Invalid token format', 401);
    }
    return decoded as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401);
    }
    throw new AuthError('Token verification failed', 401);
  }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new AuthError('Password hashing failed', 500);
  }
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new AuthError('Password comparison failed', 500);
  }
}