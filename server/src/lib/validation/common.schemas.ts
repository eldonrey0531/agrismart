import { z } from 'zod';

// Base pagination schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
}).refine(
  (data) => data.page > 0,
  { message: 'Page must be greater than 0', path: ['page'] }
).refine(
  (data) => data.limit > 0 && data.limit <= 100,
  { message: 'Limit must be between 1 and 100', path: ['limit'] }
);

// ID validation schema
export const idSchema = z.string().uuid('Invalid ID format');

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before or equal to end date', path: ['startDate'] }
);

// Price range schema
export const priceRangeSchema = z.object({
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional()
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: 'Minimum price must be less than or equal to maximum price', path: ['minPrice'] }
);

// Sort order schema
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// Common string validations
export const stringValidations = {
  email: z.string().email('Invalid email address').min(5).max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  phone: z.string()
    .regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  url: z.string().url('Invalid URL format'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
};

// Common number validations
export const numberValidations = {
  positiveInt: z.number().int().positive('Must be a positive integer'),
  nonNegativeInt: z.number().int().min(0, 'Must be zero or positive'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5')
};

// File validations
export const fileValidations = {
  imageType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  documentType: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  maxSize: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB')
};

// Common query parameters
export const queryParams = {
  search: z.string().min(2, 'Search query must be at least 2 characters').max(100).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived']).optional(),
  dateRange: dateRangeSchema.optional(),
  priceRange: priceRangeSchema.optional(),
  sort: z.object({
    field: z.string(),
    order: sortOrderSchema
  }).optional()
};

// Reusable refinement functions
export const refinements = {
  dateRange: (startDate: string, endDate: string) => {
    return new Date(startDate) <= new Date(endDate);
  },
  priceRange: (minPrice?: number, maxPrice?: number) => {
    if (minPrice && maxPrice) {
      return minPrice <= maxPrice;
    }
    return true;
  },
  arrayLength: (arr: any[], min: number, max: number) => {
    return arr.length >= min && arr.length <= max;
  }
};

// Export types
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type PriceRange = z.infer<typeof priceRangeSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;