import { z } from 'zod';
import { mongoIdSchema, paginationSchema, locationSchema } from './common.schema';

/**
 * Product categories
 */
export const categorySchema = z.enum([
  'VEGETABLES',
  'FRUITS',
  'GRAINS',
  'LIVESTOCK',
  'POULTRY',
  'FISH',
  'DAIRY',
  'SEEDS',
  'EQUIPMENT',
  'SUPPLIES',
  'OTHER'
]);

/**
 * Product condition
 */
export const conditionSchema = z.enum([
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
  'POOR'
]);

/**
 * Price range validation
 */
export const priceRangeSchema = z.object({
  min: z.number().min(0).default(0),
  max: z.number().min(0).optional(),
}).refine(data => !data.max || data.min <= data.max, {
  message: 'Maximum price must be greater than minimum price',
  path: ['max']
});

/**
 * Create product validation
 */
export const createProductSchema = z.object({
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: categorySchema,
  price: z.number()
    .min(0, 'Price must be greater than or equal to 0'),
  quantity: z.number()
    .int()
    .min(1, 'Quantity must be at least 1'),
  condition: conditionSchema,
  location: locationSchema,
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum of 10 images allowed'),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum of 10 tags allowed'),
  specifications: z.record(z.string()).optional()
});

/**
 * Update product validation
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Product search parameters
 */
export const productSearchSchema = z.object({
  query: z.string().optional(),
  category: categorySchema.optional(),
  condition: conditionSchema.optional(),
  priceRange: priceRangeSchema.optional(),
  location: locationSchema.optional(),
  radius: z.number().min(0).max(100).optional(), // km
  tags: z.array(z.string()).optional(),
  ...paginationSchema.shape
});

/**
 * Create order validation
 */
export const createOrderSchema = z.object({
  productId: mongoIdSchema,
  quantity: z.number().int().min(1),
  shippingAddress: locationSchema,
  note: z.string().max(500).optional()
});

/**
 * Update order status
 */
export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const updateOrderSchema = z.object({
  status: orderStatusSchema,
  note: z.string().max(500).optional()
});

// Export types
export type Category = z.infer<typeof categorySchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type PriceRange = z.infer<typeof priceRangeSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductSearchParams = z.infer<typeof productSearchSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;