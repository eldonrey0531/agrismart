import { z } from "zod";

// Common validation patterns
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const commonValidations = {
  objectId: z.string().regex(objectIdRegex, "Invalid ObjectId format"),
  timestamp: z.string().datetime(),
  url: z.string().url(),
  phone: z.string().regex(/^\+63\d{10}$/, "Must be a valid Philippines phone number (+63 format)"),
  email: z.string().email(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().min(1).max(100),
  }),
};

// Validation version control
export const VALIDATION_VERSION = "1.0.0";

// Consistent error messages
export const errorMessages = {
  required: "This field is required",
  invalidFormat: "Invalid format",
  tooLong: "Text is too long",
  tooShort: "Text is too short",
  invalidCategory: "Invalid category",
  invalidLocation: "Invalid location format",
  invalidImage: "Invalid image format or size",
};

// Standardized validation configs
export const validationConfig = {
  description: {
    minLength: 10,
    maxLength: 2000,
  },
  title: {
    minLength: 3,
    maxLength: 100,
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxDimensions: {
      width: 2048,
      height: 2048,
    },
  },
} as const;