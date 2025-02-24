import { z } from 'zod';

// User roles and permissions
export const UserRoleSchema = z.enum([
  'USER',
  'SELLER',
  'ADMIN',
  'SUPER_ADMIN',
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const PermissionSchema = z.enum([
  'READ_PRODUCTS',
  'CREATE_PRODUCTS',
  'UPDATE_PRODUCTS',
  'DELETE_PRODUCTS',
  'MANAGE_USERS',
  'MANAGE_SELLERS',
  'VIEW_ANALYTICS',
  'MANAGE_SYSTEM',
]);

export type Permission = z.infer<typeof PermissionSchema>;

// User account status
export const AccountStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'BANNED',
]);

export type AccountStatus = z.infer<typeof AccountStatusSchema>;

// Base user type
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  permissions: z.array(PermissionSchema),
  status: AccountStatusSchema,
  emailVerified: z.boolean(),
  phoneNumber: z.string().optional(),
  avatar: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Session token type
export const SessionTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type SessionToken = z.infer<typeof SessionTokenSchema>;

// Authentication requests
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  phoneNumber: z.string().optional(),
  role: z.literal('USER').or(z.literal('SELLER')),
  acceptTerms: z.literal(true),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Authentication responses
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
    expiresAt: z.string().datetime(),
  }).optional(),
  error: z.object({
    code: z.enum([
      'INVALID_CREDENTIALS',
      'USER_NOT_FOUND',
      'USER_SUSPENDED',
      'EMAIL_NOT_VERIFIED',
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
      'INSUFFICIENT_PERMISSIONS',
      'VALIDATION_ERROR',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }).optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// JWT payload structure
export const JWTPayloadSchema = z.object({
  sub: z.string(), // user ID
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  permissions: z.array(PermissionSchema),
  status: AccountStatusSchema,
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Password reset/update
export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordUpdateSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordUpdate = z.infer<typeof PasswordUpdateSchema>;

// Email verification
export const EmailVerificationSchema = z.object({
  token: z.string(),
});

export type EmailVerification = z.infer<typeof EmailVerificationSchema>;