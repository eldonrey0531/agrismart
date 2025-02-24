import { z } from 'zod';
import { paginationSchema } from './common.schemas';
import { MarketTypes } from '../../types';

// Product schemas
export const productSchema = {
  id: z.object({
    params: z.object({
      id: z.string().uuid('Invalid product ID format')
    })
  }),

  create: z.object({
    body: z.object({
      title: z.string().min(3, 'Title must be at least 3 characters').max(100),
      description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
      price: z.number().positive('Price must be greater than 0'),
      stock: z.number().int().min(0, 'Stock cannot be negative'),
      category: z.string().min(2, 'Category must be at least 2 characters'),
      images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(10)
    })
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid product ID format')
    }),
    body: z.object({
      title: z.string().min(3).max(100).optional(),
      description: z.string().min(10).max(2000).optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
      category: z.string().min(2).optional(),
      images: z.array(z.string().url()).min(1).max(10).optional()
    })
  }),

  query: z.object({
    query: paginationSchema.extend({
      category: z.string().optional(),
      minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
      maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
      sortBy: z.enum(['price', 'rating', 'newest']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional()
    })
  })
};

// Category schemas
export const categorySchema = {
  id: z.object({
    params: z.object({
      id: z.string().uuid('Invalid category ID format')
    })
  }),

  create: z.object({
    body: z.object({
      name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
      description: z.string().max(500).optional(),
      parentId: z.string().uuid('Invalid parent category ID').optional()
    })
  }),

  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid category ID format')
    }),
    body: z.object({
      name: z.string().min(2).max(50).optional(),
      description: z.string().max(500).optional(),
      isActive: z.boolean().optional()
    })
  })
};

// Review schemas
export const reviewSchema = {
  create: z.object({
    params: z.object({
      id: z.string().uuid('Invalid ID format')
    }),
    body: z.object({
      rating: z.number().min(1).max(5),
      comment: z.string().min(10, 'Review must be at least 10 characters').max(500),
      orderId: z.string().uuid('Invalid order ID format').optional()
    })
  }),

  query: z.object({
    query: paginationSchema.extend({
      rating: z.number().min(1).max(5).optional(),
      sortBy: z.enum(['date', 'rating']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional()
    })
  })
};

// Search schema
export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(2, 'Search query must be at least 2 characters'),
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    ...paginationSchema.shape,
    sortBy: z.enum(['relevance', 'price', 'rating', 'newest']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }).refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"]
    }
  )
});

// Filter schemas
export const filterSchema = z.object({
  query: z.object({
    category: z.string().optional()
  })
});

// Export type utilities
export type CreateProductSchema = z.infer<typeof productSchema.create>;
export type UpdateProductSchema = z.infer<typeof productSchema.update>;
export type ProductQuerySchema = z.infer<typeof productSchema.query>;
export type CreateReviewSchema = z.infer<typeof reviewSchema.create>;
export type SearchQuerySchema = z.infer<typeof searchSchema>;

// Validation middleware factory
export const validate = {
  product: {
    create: productSchema.create,
    update: productSchema.update,
    query: productSchema.query,
    id: productSchema.id
  },
  category: {
    create: categorySchema.create,
    update: categorySchema.update,
    id: categorySchema.id
  },
  review: {
    create: reviewSchema.create,
    query: reviewSchema.query
  },
  search: searchSchema,
  filter: filterSchema
};