import { z } from 'zod';
import { mongoIdSchema } from './common.schema';

/**
 * Message types
 */
export const messageTypeSchema = z.enum([
  'TEXT',
  'IMAGE',
  'FILE',
  'LOCATION',
  'PRODUCT',
  'SYSTEM'
]);

/**
 * Chat types
 */
export const chatTypeSchema = z.enum([
  'DIRECT',     // One-to-one chat
  'GROUP',      // Group chat
  'SUPPORT',    // Customer support
  'SYSTEM'      // System notifications
]);

/**
 * Create chat validation
 */
export const createChatSchema = z.object({
  type: chatTypeSchema,
  participants: z.array(mongoIdSchema)
    .min(1, 'At least one participant is required')
    .max(50, 'Maximum of 50 participants allowed'),
  name: z.string()
    .min(1, 'Chat name is required')
    .max(100, 'Chat name cannot exceed 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
});

/**
 * Send message validation
 */
export const sendMessageSchema = z.object({
  chatId: mongoIdSchema,
  type: messageTypeSchema,
  content: z.string()
    .min(1, 'Message content is required')
    .max(2000, 'Message content cannot exceed 2000 characters'),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url('Invalid attachment URL'),
    name: z.string(),
    size: z.number().optional(),
    mimeType: z.string().optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Update message validation
 */
export const updateMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message content is required')
    .max(2000, 'Message content cannot exceed 2000 characters')
});

/**
 * Chat search/filter parameters
 */
export const chatSearchSchema = z.object({
  query: z.string().optional(),
  type: chatTypeSchema.optional(),
  participant: mongoIdSchema.optional(),
  unreadOnly: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

/**
 * Chat markers (typing, read receipts)
 */
export const chatMarkerSchema = z.object({
  chatId: mongoIdSchema,
  messageId: mongoIdSchema.optional(),
  type: z.enum(['TYPING', 'READ', 'DELIVERED']),
  timestamp: z.date().default(() => new Date())
});

/**
 * Chat settings
 */
export const chatSettingsSchema = z.object({
  chatId: mongoIdSchema,
  muted: z.boolean().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  notifications: z.boolean().optional(),
  theme: z.string().optional(),
  customBackground: z.string().url().optional()
});

/**
 * Group chat management
 */
export const updateGroupChatSchema = z.object({
  chatId: mongoIdSchema,
  name: z.string()
    .min(1, 'Chat name is required')
    .max(100, 'Chat name cannot exceed 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  addParticipants: z.array(mongoIdSchema).optional(),
  removeParticipants: z.array(mongoIdSchema).optional()
});

// Export types
export type MessageType = z.infer<typeof messageTypeSchema>;
export type ChatType = z.infer<typeof chatTypeSchema>;
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type ChatSearchParams = z.infer<typeof chatSearchSchema>;
export type ChatMarker = z.infer<typeof chatMarkerSchema>;
export type ChatSettings = z.infer<typeof chatSettingsSchema>;
export type UpdateGroupChatInput = z.infer<typeof updateGroupChatSchema>;