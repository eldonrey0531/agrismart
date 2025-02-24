import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
type Secret = string | Buffer;
import config from '../config/env.js';
import { AuthenticationError } from './app-error.js';
import { Types } from 'mongoose';

interface JwtPayload {
  id: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export const generateToken = (userId: Types.ObjectId): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT secret is not configured');
  }
  const expiresIn = typeof config.jwtExpiresIn === 'number' 
    ? config.jwtExpiresIn 
    : '7d';

  return jwt.sign(
    { id: userId.toString() },
    config.jwtSecret as Secret,
    { expiresIn }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret as Secret) as JwtPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};
