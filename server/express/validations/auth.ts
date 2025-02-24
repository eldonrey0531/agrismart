import { z } from 'zod';
import { UserRole } from '../types/user';

// Common validation rules
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

const passwordRules = {
  min: 8,
  max: 100,
  message: {
    min: 'Password must be at least 8 characters',
    max: 'Password cannot exceed 100 characters',
    pattern: 'Password must contain uppercase, lowercase, number, and special character',
  },
};

// Base schemas
export const emailSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .regex(EMAIL_REGEX, 'Invalid email format')
    .min(5, 'Email is too short')
    .max(254, 'Email is too long'),
});

export const passwordSchema = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
  .min(passwordRules.min, passwordRules.message.min)
  .max(passwordRules.max, passwordRules.message.max)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Login validation
export const loginSchema = z.object({
  email: emailSchema.shape.email,
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  }),
});

// Registration validation
export const registrationSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema,
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  mobile: z
    .string({
      required_error: 'Mobile number is required',
      invalid_type_error: 'Mobile number must be a string',
    })
    .regex(PHONE_REGEX, 'Invalid mobile number format'),
  notificationPreferences: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    })
    .optional(),
});

// Email verification validation
export const verifyEmailSchema = z.object({
  token: z
    .string({
      required_error: 'Verification token is required',
      invalid_type_error: 'Token must be a string',
    })
    .min(1, 'Token is required'),
});

// Password reset request validation
export const passwordResetRequestSchema = emailSchema;

// Password reset confirmation validation
export const passwordResetSchema = z.object({
  token: z
    .string({
      required_error: 'Reset token is required',
      invalid_type_error: 'Token must be a string',
    })
    .min(1, 'Token is required'),
  password: passwordSchema,
}).refine((data) => data.token.length > 32, {
  message: 'Invalid reset token',
  path: ['token'],
});

// Password change validation
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string({
      required_error: 'Current password is required',
      invalid_type_error: 'Current password must be a string',
    }),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Email change validation
export const emailChangeSchema = z.object({
  email: emailSchema.shape.email,
  password: z.string({
    required_error: 'Password is required for verification',
    invalid_type_error: 'Password must be a string',
  }),
});

// Role validation
export const roleSchema = z.nativeEnum(UserRole);

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type EmailChangeInput = z.infer<typeof emailChangeSchema>;