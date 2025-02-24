import { sign, verify, SignOptions, JwtPayload } from 'jsonwebtoken';
import { User } from '@/types/auth';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(user: User): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const signOptions: SignOptions = {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800', 10), // Default to 7 days in seconds
  };

  return sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    } as TokenPayload,
    process.env.JWT_SECRET,
    signOptions
  );
}

export function verifyToken(token: string): TokenPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return verify(token, process.env.JWT_SECRET) as TokenPayload;
}