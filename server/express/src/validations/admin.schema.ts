import { z } from 'zod';
import { mongoIdSchema, dateRangeSchema } from './common.schema';

/**
 * User management schemas
 */
export const userStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'BANNED'
]);

export const userRoleSchema = z.enum([
  'USER',
  'SELLER',
  'MODERATOR',
  'ADMIN'
]);

export const updateUserSchema = z.object({
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  note: z.string().max(500).optional(),
  flags: z.array(z.string()).optional()
});

/**
 * Content moderation schemas
 */
export const moderationActionSchema = z.enum([
  'APPROVE',
  'REJECT',
  'FLAG',
  'HIDE',
  'DELETE'
]);

export const moderationReasonSchema = z.enum([
  'SPAM',
  'INAPPROPRIATE',
  'OFFENSIVE',
  'MISLEADING',
  'DUPLICATE',
  'OTHER'
]);

export const moderationSchema = z.object({
  targetId: mongoIdSchema,
  targetType: z.enum(['USER', 'PRODUCT', 'MESSAGE', 'COMMENT']),
  action: moderationActionSchema,
  reason: moderationReasonSchema,
  note: z.string().max(500).optional(),
  expiresAt: z.date().optional()
});

/**
 * Analytics query schemas
 */
export const metricsTypeSchema = z.enum([
  'USERS',
  'PRODUCTS',
  'ORDERS',
  'REVENUE',
  'MESSAGES',
  'ACTIVITY'
]);

export const analyticsQuerySchema = z.object({
  type: metricsTypeSchema,
  dateRange: dateRangeSchema,
  interval: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']).default('DAY'),
  filters: z.record(z.any()).optional()
});

/**
 * System configuration schemas
 */
export const maintenanceModeSchema = z.object({
  enabled: z.boolean(),
  message: z.string().max(500).optional(),
  allowedIPs: z.array(z.string()).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional()
});

export const systemSettingsSchema = z.object({
  maintenanceMode: maintenanceModeSchema.optional(),
  rateLimits: z.record(z.number()).optional(),
  featureFlags: z.record(z.boolean()).optional(),
  cacheSettings: z.record(z.number()).optional()
});

/**
 * Activity logging schemas
 */
export const activityTypeSchema = z.enum([
  'USER_ACTION',
  'SYSTEM_EVENT',
  'ERROR',
  'SECURITY',
  'PERFORMANCE'
]);

export const activityLogSchema = z.object({
  type: activityTypeSchema,
  severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
  message: z.string().max(1000),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date())
});

/**
 * Report generation schemas
 */
export const reportTypeSchema = z.enum([
  'USER_ACTIVITY',
  'SALES',
  'MODERATION',
  'PERFORMANCE',
  'AUDIT'
]);

export const reportFormatSchema = z.enum([
  'PDF',
  'CSV',
  'EXCEL',
  'JSON'
]);

export const generateReportSchema = z.object({
  type: reportTypeSchema,
  dateRange: dateRangeSchema,
  format: reportFormatSchema.default('PDF'),
  filters: z.record(z.any()).optional(),
  includeMetadata: z.boolean().default(true)
});

// Export types
export type UserStatus = z.infer<typeof userStatusSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ModerationAction = z.infer<typeof moderationActionSchema>;
export type ModerationInput = z.infer<typeof moderationSchema>;
export type MetricsType = z.infer<typeof metricsTypeSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type MaintenanceMode = z.infer<typeof maintenanceModeSchema>;
export type SystemSettings = z.infer<typeof systemSettingsSchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;
export type ReportType = z.infer<typeof reportTypeSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;