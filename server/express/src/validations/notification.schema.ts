import { z } from 'zod';
import { mongoIdSchema } from './common.schema';

/**
 * Notification types
 */
export const notificationTypeSchema = z.enum([
  'SYSTEM',
  'ORDER',
  'CHAT',
  'PRODUCT',
  'USER',
  'SECURITY',
  'PROMOTION'
]);

/**
 * Notification priority
 */
export const prioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
]);

/**
 * Notification channels
 */
export const channelSchema = z.enum([
  'IN_APP',
  'EMAIL',
  'SMS',
  'PUSH'
]);

/**
 * Create notification schema
 */
export const createNotificationSchema = z.object({
  userId: mongoIdSchema,
  type: notificationTypeSchema,
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters'),
  priority: prioritySchema.default('LOW'),
  channels: z.array(channelSchema)
    .min(1, 'At least one channel is required')
    .default(['IN_APP']),
  data: z.record(z.any()).optional(),
  image: z.string().url('Invalid image URL').optional(),
  action: z.object({
    type: z.string(),
    url: z.string().url('Invalid action URL'),
    label: z.string()
  }).optional(),
  expiresAt: z.date().optional()
});

/**
 * Notification preferences schema
 */
export const notificationPreferencesSchema = z.object({
  enabled: z.boolean().default(true),
  channels: z.array(channelSchema).default(['IN_APP']),
  types: z.array(notificationTypeSchema).optional(),
  quiet: z.boolean().default(false),
  quietHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)')
  }).optional(),
  filters: z.record(z.boolean()).optional()
});

/**
 * Notification query schema
 */
export const notificationQuerySchema = z.object({
  type: notificationTypeSchema.optional(),
  priority: prioritySchema.optional(),
  read: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1)
});

/**
 * Batch notification schema
 */
export const batchNotificationSchema = z.object({
  userIds: z.array(mongoIdSchema)
    .min(1, 'At least one user ID is required')
    .max(1000, 'Cannot exceed 1000 users'),
  notification: createNotificationSchema.omit({ userId: true })
});

/**
 * Update notification schema
 */
export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
  dismissed: z.boolean().optional()
});

// Export types
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof prioritySchema>;
export type NotificationChannel = z.infer<typeof channelSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type BatchNotificationInput = z.infer<typeof batchNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;