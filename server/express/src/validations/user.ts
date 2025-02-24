import { z } from 'zod';
import { UserRole, UserStatus } from '../types/user';

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  mobile: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format').optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(UserStatus) as [string, ...string[]]).optional(),
  accountLevel: z.string().optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
}).refine(data => {
  // At least one field must be present
  return Object.keys(data).length > 0;
}, {
  message: 'At least one field must be provided for update',
});

export const userQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(Object.values(UserStatus) as [string, ...string[]]).optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  search: z.string().min(1).max(100).optional(),
}).refine(data => {
  // Validate page and limit ranges if provided
  if (data.page && (data.page < 1 || data.page > 1000)) {
    return false;
  }
  if (data.limit && (data.limit < 1 || data.limit > 100)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid pagination parameters. Page must be between 1-1000 and limit between 1-100',
});