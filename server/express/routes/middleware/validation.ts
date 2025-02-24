import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Product validation schemas
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(0).max(50000).optional() // max 50km
});

export const productValidation = {
  search: z.object({
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
        .transform(val => val ? parseFloat(val) : undefined),
      longitude: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined),
      radius: z.string()
        .optional()
        .transform(val => val ? parseFloat(val) : undefined)
    }).superRefine((data, ctx) => {
      // Validate location parameters
      const hasLat = data.latitude !== undefined;
      const hasLong = data.longitude !== undefined;
      if ((hasLat && !hasLong) || (!hasLat && hasLong)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Both latitude and longitude must be provided for location search',
          path: ['location']
        });
      }
      if (hasLat && hasLong) {
        try {
          locationSchema.parse({
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: err.message,
                path: ['location', err.path[0]]
              });
            });
          }
        }
      }
    })
  }),

  create: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      description: z.string().min(1).max(2000),
      price: z.number().min(0),
      categoryId: z.string(),
      condition: z.enum(['new', 'used']),
      images: z.array(z.string()).optional(),
      location: locationSchema.optional()
    })
  }),

  update: z.object({
    params: z.object({
      id: z.string()
    }),
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().min(1).max(2000).optional(),
      price: z.number().min(0).optional(),
      categoryId: z.string().optional(),
      condition: z.enum(['new', 'used']).optional(),
      images: z.array(z.string()).optional(),
      location: locationSchema.optional()
    })
  }),

  delete: z.object({
    params: z.object({
      id: z.string()
    })
  }),

  uploadImages: z.object({
    params: z.object({
      id: z.string()
    })
  }),

  deleteImage: z.object({
    params: z.object({
      id: z.string(),
      imageId: z.string()
    })
  })
};