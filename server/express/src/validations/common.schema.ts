import { z } from 'zod';

/**
 * Common validation schemas
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ID'
});

export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(255, 'Email is too long')
  .transform(email => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const phoneSchema = z
  .string()
  .regex(/^\+63[0-9]{10}$/, {
    message: 'Invalid phone number format. Must be in +63XXXXXXXXXX format'
  });

export const dateSchema = z.coerce.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date format'
});

export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema
  })
  .refine(data => data.startDate <= data.endDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  });

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape
});

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, {
    message: 'Only image files (jpeg, png, gif, webp) are allowed'
  }),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB')
});

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const locationSchema = z.object({
  coordinates: coordinatesSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default('Philippines'),
  postalCode: z.string().optional()
});

// Types
export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type FileUpload = z.infer<typeof fileSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Location = z.infer<typeof locationSchema>;