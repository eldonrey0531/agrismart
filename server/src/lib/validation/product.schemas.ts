import { z } from 'zod';

// Base schemas
const priceSchema = z.number()
  .positive('Price must be positive')
  .min(0.01, 'Minimum price is 0.01')
  .max(999999.99, 'Maximum price is 999,999.99');

const stockSchema = z.number()
  .int('Stock must be a whole number')
  .min(0, 'Stock cannot be negative')
  .max(999999, 'Maximum stock is 999,999');

const imageUrlSchema = z.string()
  .url('Invalid image URL')
  .startsWith('https://', 'Image URL must use HTTPS');

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),
    price: priceSchema,
    stock: stockSchema,
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category cannot exceed 50 characters'),
    images: z.array(imageUrlSchema)
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
  })
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  }),
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional(),
    price: priceSchema.optional(),
    stock: stockSchema.optional(),
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),
    images: z.array(imageUrlSchema)
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
      .optional()
  })
});

// Query schemas
export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    sortBy: z.enum(['title', 'price', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    inStock: z.string().transform(val => val === 'true').optional()
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

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(2, 'Search query must be at least 2 characters'),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

// Review schemas
export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  }),
  body: z.object({
    rating: z.number()
      .int('Rating must be a whole number')
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5'),
    comment: z.string()
      .min(10, 'Review must be at least 10 characters')
      .max(500, 'Review cannot exceed 500 characters')
  })
});

export const reviewQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID')
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['rating', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

// Common ID schema
export const idSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ID')
  })
});

// Response types
export interface ProductResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: {
    id: string;
    name: string;
  };
}

// Validation helper
export const validateProduct = {
  create: (data: unknown) => createProductSchema.parse(data),
  update: (data: unknown) => updateProductSchema.parse(data),
  query: (data: unknown) => productQuerySchema.parse(data),
  search: (data: unknown) => searchQuerySchema.parse(data),
  createReview: (data: unknown) => createReviewSchema.parse(data),
  reviewQuery: (data: unknown) => reviewQuerySchema.parse(data),
  id: (data: unknown) => idSchema.parse(data)
};