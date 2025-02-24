import { z } from "zod";
import { errorMessages, validationConfig } from "./common";

// Location schema - standardized as an object with lat/lng
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Category schema - using an enum to enforce consistent values
export const categoryEnum = [
  "VEGETABLES",
  "FRUITS",
  "GRAINS",
  "LIVESTOCK",
  "POULTRY",
  "FISH",
  "DAIRY",
  "EQUIPMENT",
  "SUPPLIES",
  "OTHER",
] as const;

export const categorySchema = z.enum(categoryEnum, {
  errorMap: () => ({ message: errorMessages.invalidCategory }),
});

// Description schema with consistent length limits
export const descriptionSchema = z.string()
  .min(validationConfig.description.minLength, {
    message: `Description must be at least ${validationConfig.description.minLength} characters`,
  })
  .max(validationConfig.description.maxLength, {
    message: `Description cannot exceed ${validationConfig.description.maxLength} characters`,
  });

// Image validation schema
export const imageValidationSchema = z.object({
  url: z.string().url(),
  size: z.number().max(validationConfig.image.maxSize),
  type: z.union([
    z.literal("image/jpeg"),
    z.literal("image/png"),
    z.literal("image/webp"),
  ]),
  width: z.number().max(validationConfig.image.maxDimensions.width),
  height: z.number().max(validationConfig.image.maxDimensions.height),
});

// Product schema combining all validations
export const productSchema = z.object({
  title: z.string()
    .min(validationConfig.title.minLength)
    .max(validationConfig.title.maxLength),
  description: descriptionSchema,
  category: categorySchema,
  location: locationSchema,
  images: z.array(imageValidationSchema).min(1).max(5),
  price: z.number().positive(),
});

// API response schemas for consistent error handling
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).optional(),
  }),
});

export const successResponseSchema = z.object({
  data: z.unknown(),
  meta: z.object({
    timestamp: z.string().datetime(),
    version: z.string(),
  }).optional(),
});

// Type exports for TypeScript usage
export type Location = z.infer<typeof locationSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ProductValidation = z.infer<typeof productSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;