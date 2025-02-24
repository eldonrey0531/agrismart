import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

export const marketplaceSchemas = {
  productCreate: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    description: z.string()
      .min(10, 'Description must be at least 10 characters'),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(1000000, 'Price cannot exceed 1,000,000'),
    category: z.enum(['electronics', 'clothing', 'food', 'home', 'other']),
    location: z.object({
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90)
      ]),
      address: z.string().min(5, 'Address is required'),
    }),
    images: z.array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed'),
  }),

  productUpdate: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(1000000, 'Price cannot exceed 1,000,000')
      .optional(),
    category: z.enum(['electronics', 'clothing', 'food', 'home', 'other'])
      .optional(),
    location: z.object({
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90)
      ]),
      address: z.string().min(5, 'Address is required'),
    }).optional(),
    images: z.array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
      .optional(),
  }),

  productId: z.object({
    productId: z.string().refine(val => isValidObjectId(val), {
      message: 'Invalid product ID',
    }),
  }),

  productIds: z.object({
    productIds: z.union([
      z.string().refine(val => isValidObjectId(val), {
        message: 'Invalid product ID',
      }),
      z.array(z.string().refine(val => isValidObjectId(val), {
        message: 'Invalid product ID',
      })),
    ]),
  }),

  pagination: z.object({
    page: z.string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 1))
      .refine(val => val > 0, {
        message: 'Page must be greater than 0',
      }),
    limit: z.string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 10))
      .refine(val => val > 0 && val <= 100, {
        message: 'Limit must be between 1 and 100',
      }),
  }),
};