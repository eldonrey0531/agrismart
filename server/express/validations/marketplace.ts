import { z } from 'zod';

export const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 1)
      .refine(val => val > 0, 'Page must be greater than 0'),
    pageSize: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 20)
      .refine(val => val > 0 && val <= 100, 'Page size must be between 1 and 100'),
    categoryId: z.string().optional(),
    sellerId: z.string().optional(),
    minPrice: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => !val || val >= 0, 'Minimum price must be non-negative'),
    maxPrice: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => !val || val >= 0, 'Maximum price must be non-negative'),
    condition: z.enum(['new', 'used', 'all']).optional(),
    sortBy: z.enum(['price', 'date', 'distance', 'relevance']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    latitude: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(
        val => !val || (val >= -90 && val <= 90),
        'Latitude must be between -90 and 90'
      ),
    longitude: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(
        val => !val || (val >= -180 && val <= 180),
        'Longitude must be between -180 and 180'
      ),
    radius: z.string()
      .optional()
      .transform(val => val ? parseFloat(val) : undefined)
      .refine(val => !val || val > 0, 'Radius must be positive')
  }).refine(
    data => {
      // If one location parameter is provided, all must be provided
      const hasLat = data.latitude !== undefined;
      const hasLong = data.longitude !== undefined;
      return (hasLat && hasLong) || (!hasLat && !hasLong);
    },
    { message: 'Both latitude and longitude must be provided for location search' }
  )
});

export type SearchQuerySchema = z.infer<typeof searchSchema>['query'];