import { z } from 'zod';
import { ProductCategory, PRODUCT_VALIDATION } from '../../types/shared';

// Reusable primitive schemas
export const numberString = z.string().regex(/^\d+$/).transform(Number);

export const positiveNumber = z.number().positive();

export const nonEmptyString = z.string().min(1).trim();

// Convert readonly array to mutable array for Zod enum
const ALLOWED_FILE_TYPES = [...PRODUCT_VALIDATION.images.types] as const;
type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

// Location schema
export const geoLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  radius: z.number().positive().optional()
});

// Product validation schemas
export const productBaseSchema = z.object({
  title: z.string()
    .min(PRODUCT_VALIDATION.title.min, `Title must be at least ${PRODUCT_VALIDATION.title.min} characters`)
    .max(PRODUCT_VALIDATION.title.max, `Title must not exceed ${PRODUCT_VALIDATION.title.max} characters`)
    .trim(),
    
  description: z.string()
    .min(PRODUCT_VALIDATION.description.min, `Description must be at least ${PRODUCT_VALIDATION.description.min} characters`)
    .max(PRODUCT_VALIDATION.description.max, `Description must not exceed ${PRODUCT_VALIDATION.description.max} characters`)
    .trim(),
    
  price: z.number()
    .min(PRODUCT_VALIDATION.price.min, `Price must be at least ${PRODUCT_VALIDATION.price.min}`)
    .max(PRODUCT_VALIDATION.price.max, `Price must not exceed ${PRODUCT_VALIDATION.price.max}`),
    
  quantity: z.number()
    .int()
    .min(PRODUCT_VALIDATION.quantity.min, `Quantity must be at least ${PRODUCT_VALIDATION.quantity.min}`)
    .max(PRODUCT_VALIDATION.quantity.max, `Quantity must not exceed ${PRODUCT_VALIDATION.quantity.max}`),
    
  category: z.nativeEnum(ProductCategory),
  
  location: geoLocationSchema,
  
  images: z.array(z.string().url())
    .min(PRODUCT_VALIDATION.images.min, `At least ${PRODUCT_VALIDATION.images.min} image is required`)
    .max(PRODUCT_VALIDATION.images.max, `Maximum ${PRODUCT_VALIDATION.images.max} images allowed`)
});

// Create product schema
export const createProductSchema = productBaseSchema.extend({
  sellerId: z.string()
});

// Update product schema
export const updateProductSchema = productBaseSchema.partial().extend({
  id: z.string()
});

// Product query schema
export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  location: geoLocationSchema.optional(),
  sortBy: z.enum(['title', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
}).refine(
  data => !(data.minPrice && data.maxPrice && data.minPrice > data.maxPrice),
  { message: "Minimum price cannot be greater than maximum price" }
);

// File validation schemas
export const fileValidationSchema = z.object({
  mimetype: z.enum(ALLOWED_FILE_TYPES),
  size: z.number().max(
    PRODUCT_VALIDATION.images.maxSize,
    `File size must not exceed ${PRODUCT_VALIDATION.images.maxSize / (1024 * 1024)}MB`
  )
});

export const fileUploadSchema = z.object({
  files: z.array(fileValidationSchema)
    .min(1, "At least one file is required")
    .max(PRODUCT_VALIDATION.images.max, `Maximum ${PRODUCT_VALIDATION.images.max} files allowed`)
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(
      z.object({
        field: z.string(),
        message: z.string()
      })
    ).optional()
  })
});

// Pagination metadata schema
export const paginationMetaSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
  additionalMeta: z.record(z.string(), z.unknown()).optional()
});

// Generic API response schema
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => 
  z.object({
    data: dataSchema,
    meta: paginationMetaSchema.optional()
  });

// Infer types from schemas
export type ProductBase = z.infer<typeof productBaseSchema>;
export type ProductCreate = z.infer<typeof createProductSchema>;
export type ProductUpdate = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>;

export const schemas = {
  product: {
    base: productBaseSchema,
    create: createProductSchema,
    update: updateProductSchema,
    query: productQuerySchema
  },
  location: geoLocationSchema,
  file: {
    single: fileValidationSchema,
    upload: fileUploadSchema
  },
  error: errorResponseSchema,
  pagination: paginationMetaSchema,
  apiResponse: apiResponseSchema
} as const;

export default schemas;