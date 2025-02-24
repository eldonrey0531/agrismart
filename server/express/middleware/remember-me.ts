import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

const REMEMBER_ME_COOKIE = 'remember_token';
const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export const rememberMe = async (req: Request, res: Response, next: NextFunction) => {
  // Skip if already authenticated
  if (req.session.userId) {
    return next();
  }

  // Check for remember me token
  const token = req.cookies[REMEMBER_ME_COOKIE];
  if (!token) {
    return next();
  }

  try {
    // Find valid remember me token
    const rememberToken = await prisma.rememberMeToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!rememberToken) {
      res.clearCookie(REMEMBER_ME_COOKIE);
      return next();
    }

    // Set session data
    req.session.userId = rememberToken.userId;
    req.session.email = rememberToken.user.email;
    req.session.role = rememberToken.user.role;
    req.session.rememberMe = true;

    // Rotate token for security
    const newToken = await rotateRememberMeToken(rememberToken.userId);
    res.cookie(REMEMBER_ME_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REMEMBER_ME_EXPIRY,
      sameSite: 'lax'
    });

    // Delete old token
    await prisma.rememberMeToken.delete({
      where: { id: rememberToken.id }
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const setRememberMe = async (userId: string): Promise<string> => {
  // Delete any existing tokens
  await prisma.rememberMeToken.deleteMany({
    where: { userId }
  });

  // Create new token
  return rotateRememberMeToken(userId);
};

const rotateRememberMeToken = async (userId: string): Promise<string> => {
  const token = generateToken();
  
  await prisma.rememberMeToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + REMEMBER_ME_EXPIRY)
    }
  });

  return token;
};

const generateToken = (): string => {
  return Buffer.from(Math.random().toString(36) + Date.now().toString())
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 32);
};