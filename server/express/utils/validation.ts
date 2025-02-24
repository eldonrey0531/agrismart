import { z } from 'zod';

// Common validation patterns
const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+[1-9]\d{1,14}$/,
  url: /^https?:\/\/.+/,
  objectId: /^[0-9a-fA-F]{24}$/,
};

// Common validation messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
  phone: 'Please enter a valid international phone number',
  url: 'Please enter a valid URL',
  min: (field: string, length: number) => `${field} must be at least ${length} characters`,
  max: (field: string, length: number) => `${field} must not exceed ${length} characters`,
  matches: (field: string) => `Please enter a valid ${field.toLowerCase()}`,
  objectId: 'Invalid ID format',
};

// Base schemas for common fields
export const baseSchemas = {
  objectId: z.string().regex(patterns.objectId, messages.objectId),
  email: z.string().email(messages.email),
  password: z.string().regex(patterns.password, messages.password),
  phone: z.string().regex(patterns.phone, messages.phone),
  url: z.string().regex(patterns.url, messages.url),
};

// Form validation schemas
export const formSchemas = {
  // User related schemas
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, messages.required),
    remember: z.boolean().optional(),
  }),

  register: z.object({
    name: z.string().min(2, messages.min('Name', 2)),
    email: baseSchemas.email,
    password: baseSchemas.password,
    phone: baseSchemas.phone,
  }),

  // Product related schemas
  productCreate: z.object({
    title: z.string().min(3, messages.min('Title', 3)).max(100, messages.max('Title', 100)),
    description: z.string().min(10, messages.min('Description', 10)),
    price: z.number().positive('Price must be greater than 0'),
    category: z.string().min(1, messages.required),
    location: z.object({
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ]),
      address: z.string().min(5, messages.min('Address', 5)),
    }),
    images: z.array(z.string().regex(patterns.url, messages.url)).min(1, 'At least one image is required'),
  }),

  // Order related schemas
  orderCreate: z.object({
    productId: baseSchemas.objectId,
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    shippingAddress: z.string().min(10, messages.min('Shipping address', 10)),
    paymentMethod: z.enum(['card', 'cash']),
  }),

  // Chat related schemas
  message: z.object({
    conversationId: baseSchemas.objectId,
    content: z.string().min(1, messages.required).max(1000, messages.max('Message', 1000)),
    attachments: z.array(z.string().regex(patterns.url, messages.url)).optional(),
  }),

  // Report related schemas
  report: z.object({
    contentType: z.enum(['product', 'user', 'chat', 'review']),
    contentId: baseSchemas.objectId,
    reason: z.enum(['inappropriate', 'spam', 'fake', 'offensive', 'illegal', 'other']),
    description: z.string().min(10, messages.min('Description', 10)).max(1000, messages.max('Description', 1000)),
  }),
};

// Validation helper functions
export const validateInput = async <T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message 
      };
    }
    return { 
      success: false, 
      error: 'Validation failed' 
    };
  }
};

export default {
  patterns,
  messages,
  baseSchemas,
  formSchemas,
  validateInput,
};
