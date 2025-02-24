import { z } from "zod";
import { Types } from "mongoose";

// MongoDB ObjectId validation
const objectIdSchema = z.string().refine((val) => 
  Types.ObjectId.isValid(val), 
  "Invalid MongoDB ObjectId"
);

// Product category validation matching the enum in the model
export const productCategoryEnum = [
  "electronics",
  "clothing",
  "food",
  "home",
  "other",
] as const;

export const productStatusEnum = [
  "active",
  "inactive",
  "deleted",
] as const;

// Location validation matching the model's requirements
export const locationSchema = z.object({
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  address: z.string().min(1, "Address is required"),
});

// Base product validation schema
export const createProductSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .trim(),
  price: z.number()
    .min(0, "Price cannot be negative"),
  category: z.enum(productCategoryEnum, {
    errorMap: () => ({ message: "Invalid product category" }),
  }),
  location: locationSchema,
  images: z.array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
});

// Schema for updating products
export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(productStatusEnum).optional(),
});

// Schema for product search/filtering
export const productFilterSchema = z.object({
  query: z.string().optional(),
  category: z.enum(productCategoryEnum).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  location: z.object({
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    radius: z.number().positive(), // radius in kilometers
  }).optional(),
  status: z.enum(productStatusEnum).optional().default("active"),
  seller: objectIdSchema.optional(),
  sortBy: z.enum(["price", "createdAt", "likes"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

// Product search response schema
export const productResponseSchema = z.object({
  _id: objectIdSchema,
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(productCategoryEnum),
  seller: objectIdSchema,
  status: z.enum(productStatusEnum),
  location: locationSchema,
  images: z.array(z.string()),
  likes: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Validation error formatter
export const formatValidationErrors = (error: z.ZodError) => ({
  error: {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  },
});

// Validation middleware
export const validateProduct = async (data: unknown) => {
  try {
    return {
      success: true,
      data: await createProductSchema.parseAsync(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: formatValidationErrors(error),
      };
    }
    throw error;
  }
};

// Type exports for TypeScript usage
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;