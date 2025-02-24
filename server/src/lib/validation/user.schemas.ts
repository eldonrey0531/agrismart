import { z } from 'zod';
import { stringValidations } from './common.schemas';

export const userValidation = {
  // Profile schemas
  updateProfile: z.object({
    name: stringValidations.name.optional(),
    bio: z.string().max(500).optional(),
    phone: stringValidations.phone.optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    language: z.string().length(2).optional(),
    timezone: z.string().optional()
  }),

  avatar: z.object({
    file: z.any()
  }),

  // Settings schemas
  updateSettings: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    currency: z.string().length(3).optional(),
    visibility: z.enum(['public', 'private']).optional()
  }),

  // Security schemas
  changePassword: z.object({
    currentPassword: stringValidations.password,
    newPassword: stringValidations.password,
    confirmPassword: stringValidations.password
  }).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    }
  ),

  enable2FA: z.object({
    phoneNumber: stringValidations.phone
  }),

  verify2FA: z.object({
    code: z.string().length(6).regex(/^\d+$/, 'Must be a 6-digit number')
  }),

  disable2FA: z.object({
    confirmPassword: stringValidations.password
  }),

  // Notification schemas
  notifications: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    type: z.enum(['all', 'unread', 'read']).optional(),
    sortBy: z.enum(['date', 'type']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }),

  notificationSettings: z.object({
    email: z.object({
      orderUpdates: z.boolean(),
      promotions: z.boolean(),
      security: z.boolean(),
      newsletter: z.boolean()
    }),
    push: z.object({
      orderUpdates: z.boolean(),
      chat: z.boolean(),
      promotions: z.boolean()
    })
  }),

  // Account schemas
  deleteAccount: z.object({
    password: stringValidations.password,
    reason: z.string().optional(),
    confirmation: z.literal('DELETE MY ACCOUNT')
  }),

  // Address schemas
  addressId: z.object({
    id: z.string().uuid('Invalid address ID')
  }),

  createAddress: z.object({
    label: z.string().min(2).max(50),
    name: stringValidations.name,
    phone: stringValidations.phone,
    street: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    country: z.string().length(2),
    postalCode: z.string().min(4).max(10),
    isDefault: z.boolean().optional()
  }),

  updateAddress: z.object({
    label: z.string().min(2).max(50).optional(),
    name: stringValidations.name.optional(),
    phone: stringValidations.phone.optional(),
    street: z.string().min(5).max(100).optional(),
    city: z.string().min(2).max(50).optional(),
    state: z.string().min(2).max(50).optional(),
    country: z.string().length(2).optional(),
    postalCode: z.string().min(4).max(10).optional(),
    isDefault: z.boolean().optional()
  }),

  // Activity logs
  activityLogs: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    type: z.enum(['all', 'auth', 'profile', 'security', 'orders']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  }),

  // Connected accounts
  provider: z.object({
    provider: z.enum(['google', 'facebook', 'apple'])
  }),

  connectAccount: z.object({
    token: z.string(),
    data: z.record(z.any()).optional()
  })
};

// Export types
export type UpdateProfileSchema = z.infer<typeof userValidation.updateProfile>;
export type UpdateSettingsSchema = z.infer<typeof userValidation.updateSettings>;
export type ChangePasswordSchema = z.infer<typeof userValidation.changePassword>;
export type CreateAddressSchema = z.infer<typeof userValidation.createAddress>;
export type UpdateAddressSchema = z.infer<typeof userValidation.updateAddress>;
export type NotificationSettingsSchema = z.infer<typeof userValidation.notificationSettings>;