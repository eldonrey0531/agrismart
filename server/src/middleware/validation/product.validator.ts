import { Request, Response, NextFunction } from 'express';
import { Product } from '@/types';

export const validateProductInput = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, price } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters long' });
  }

  // Description validation
  if (!description || typeof description !== 'string' || description.length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters long' });
  }

  // Price validation
  if (!price || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  next();
};
