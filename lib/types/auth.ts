import { z } from 'zod';

// Role and status types
export type Role = "user" | "admin" | "moderator" | "seller";
export type AccountStatus = "active" | "suspended" | "pending";
export type TokenType = "access" | "refresh" | "verification";

// Base session interface
export interface BaseUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role: string;
  accountLevel: string;
}

// Extend next-auth
declare module "next-auth" {
  interface Session {
    user: BaseUser
  }
}

// JWT extension
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accountLevel: string;
  }
}

// Token payload type
export interface TokenPayload {
  userId: string;
  email: string | null;
  role?: Role;
  isVerified?: boolean;
  type?: TokenType;
  iat?: number;
  exp?: number;
}

export interface VerificationStatus {
  status: "pending" | "approved" | "rejected";
  documentId: string;
  documentType: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Database model type
export interface UserModel {
  id: string;
  email: string;
  name: string;
  password: string;
  mobile: string;
  image?: string;
  role: Role;
  isVerified: boolean;
  accountLevel: string;
  status: AccountStatus;
  statusReason?: string;
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  verificationToken?: string;
  lastVerificationEmailSent?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;
  sellerVerification?: VerificationStatus;
  notificationPreferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// Validation schemas
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+63[0-9]{10}$/, 'Phone number must be in Philippines format (+63)');

export const userAuthSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: passwordSchema,
});

export const userRegistrationSchema = userAuthSchema.extend({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  mobile: phoneSchema,
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).optional(),
});

// API types
export type LoginCredentials = z.infer<typeof userAuthSchema>;
export type RegistrationData = z.infer<typeof userRegistrationSchema>;

export interface AuthResponse {
  success: boolean;
  user: UserModel;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  message?: string;
}

// Error handling
export interface AuthError {
  message: string;
  code: AuthErrorCode;
  field?: string;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  INVALID_VERIFICATION = 'INVALID_VERIFICATION',
}