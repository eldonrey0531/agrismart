import jwt from 'jsonwebtoken';
import { Role, Status, AuthUser } from '../models/types/Role';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Use AuthUser type as our JWT payload
export type JWTPayload = Omit<AuthUser, 'emailVerified'>;

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export default {
  generateToken,
  verifyToken,
  generateRefreshToken
};