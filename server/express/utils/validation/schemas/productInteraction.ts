import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

export const productInteractionSchemas = {
  interactionToggle: z.object({
    productId: z.string().refine(val => isValidObjectId(val), {
      message: 'Invalid product ID',
    }),
    type: z.enum(['like', 'bookmark'], {
      errorMap: () => ({ message: 'Type must be either "like" or "bookmark"' }),
    }),
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

  interactionFilter: z.object({
    type: z.enum(['like', 'bookmark']).optional(),
    userId: z.string().refine(val => isValidObjectId(val), {
      message: 'Invalid user ID',
    }).optional(),
    productId: z.string().refine(val => isValidObjectId(val), {
      message: 'Invalid product ID',
    }).optional(),
    startDate: z.string()
      .transform(val => new Date(val))
      .refine(val => !isNaN(val.getTime()), {
        message: 'Invalid date format',
      })
      .optional(),
    endDate: z.string()
      .transform(val => new Date(val))
      .refine(val => !isNaN(val.getTime()), {
        message: 'Invalid date format',
      })
      .optional(),
  }),

  bulkInteraction: z.object({
    productIds: z.array(z.string().refine(val => isValidObjectId(val), {
      message: 'Invalid product ID',
    })).min(1, 'At least one product ID is required'),
    type: z.enum(['like', 'bookmark'], {
      errorMap: () => ({ message: 'Type must be either "like" or "bookmark"' }),
    }),
    action: z.enum(['add', 'remove'], {
      errorMap: () => ({ message: 'Action must be either "add" or "remove"' }),
    }),
  }),
};