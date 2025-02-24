import jwt, { SignOptions as JWTSignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-development-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = 900; // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRES_IN = 604800; // 7 days in seconds

// Basic user information included in tokens
export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  sessionVersion: number;
}

// Minimum required user data for token generation
export interface TokenUser {
  _id: Types.ObjectId | string;
  email: string;
  role: 'admin' | 'user';
  sessionVersion: number;
}

export const generateToken = (user: TokenUser, isRefreshToken = false): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  // Safely handle ObjectId conversion
  let userId: string;
  try {
    if (typeof user._id === 'string') {
      userId = user._id;
    } else if (user._id instanceof Types.ObjectId) {
      userId = user._id.toString();
    } else {
      userId = new Types.ObjectId(user._id as any).toString();
    }
  } catch (error) {
    throw new Error('Invalid user ID format');
  }

  const payload: TokenPayload = {
    userId,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion
  };

  const options: JWTSignOptions = {
    expiresIn: isRefreshToken ? REFRESH_TOKEN_EXPIRES_IN : ACCESS_TOKEN_EXPIRES_IN,
    algorithm: 'HS256'
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
  } catch (error) {
    throw new Error('Failed to generate token');
  }
};

export const verifyToken = (token: string): TokenPayload => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & TokenPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionVersion: decoded.sessionVersion
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token validation failed');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as (jwt.JwtPayload & TokenPayload) | null;
    if (!decoded) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionVersion: decoded.sessionVersion
    };
  } catch (error) {
    return null;
  }
};