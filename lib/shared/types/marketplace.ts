import { z } from 'zod';

// Product category enumeration
export const ProductCategorySchema = z.enum([
  'Seeds',
  'Soil & Fertilizers',
  'Tools & Equipment',
  'Irrigation',
  'Pest Control',
  'Harvesting Equipment',
  'Other',
]);

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

// Product condition enumeration
export const ProductConditionSchema = z.enum([
  'New',
  'Like New',
  'Good',
  'Fair',
  'For Parts',
]);

export type ProductCondition = z.infer<typeof ProductConditionSchema>;

// Location type
export const LocationSchema = z.object({
  country: z.string(),
  state: z.string().optional(),
  city: z.string(),
  postalCode: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(), // [longitude, latitude]
});

export type Location = z.infer<typeof LocationSchema>;

// Product image type
export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  isPrimary: z.boolean().default(false),
  order: z.number().min(0),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

// Base product type
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: ProductCategorySchema,
  condition: ProductConditionSchema,
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  images: z.array(ProductImageSchema).min(1).max(10),
  location: LocationSchema,
  seller: z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number().min(0).max(5).optional(),
    totalSales: z.number().int().optional(),
  }),
  specifications: z.record(z.string()).optional(),
  shipping: z.object({
    weight: z.number().positive().optional(),
    dimensions: z.tuple([z.number(), z.number(), z.number()]).optional(), // [length, width, height]
    freeShipping: z.boolean().default(false),
    shippingPrice: z.number().optional(),
  }).optional(),
  status: z.enum(['active', 'sold', 'inactive', 'deleted']).default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

// Product search/filter parameters
export const ProductFilterSchema = z.object({
  category: ProductCategorySchema.optional(),
  condition: ProductConditionSchema.optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  location: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    radius: z.number().positive().optional(), // in kilometers
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }).optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'date_desc', 'rating_desc']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;

// Create product request
export const CreateProductRequestSchema = ProductSchema.omit({
  id: true,
  seller: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

// Update product request
export const UpdateProductRequestSchema = CreateProductRequestSchema.partial();

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

// Product API response
export const ProductResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    product: ProductSchema.optional(),
    products: z.array(ProductSchema).optional(),
    total: z.number().optional(),
    page: z.number().optional(),
    totalPages: z.number().optional(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()),
  }).optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;