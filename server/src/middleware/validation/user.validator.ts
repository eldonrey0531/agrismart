import { Request, Response, NextFunction } from 'express';
import { User } from '@/types';

export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password validation
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  next();
};

export const validateProfileUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { name, bio } = req.body;

  // Name validation
  if (name && (typeof name !== 'string' || name.length < 2)) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long' });
  }

  // Bio validation
  if (bio && (typeof bio !== 'string' || bio.length > 500)) {
    return res.status(400).json({ error: 'Bio must not exceed 500 characters' });
  }

  next();
};
