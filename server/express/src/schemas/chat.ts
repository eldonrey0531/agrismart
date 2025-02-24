import { z } from 'zod';
import { schemas } from '../utils/validate';

/**
 * Create conversation schema
 */
export const createConversationSchema = z.object({
  name: z.string().min(1, 'Conversation name is required'),
  participants: z.array(z.string().min(1)).min(1, 'At least one participant is required'),
});

/**
 * Update conversation schema
 */
export const updateConversationSchema = z.object({
  name: z.string().min(1, 'Conversation name is required'),
});

/**
 * Send message schema
 */
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
});

/**
 * Get messages schema
 */
export const getMessagesSchema = schemas.pagination.extend({
  before: z.string().optional(),
  after: z.string().optional(),
});

/**
 * Search conversations schema
 */
export const searchConversationsSchema = schemas.pagination.extend({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'direct', 'group']).optional().default('all'),
});

/**
 * Search messages schema
 */
export const searchMessagesSchema = schemas.pagination.extend({
  query: z.string().min(1, 'Search query is required'),
  conversationId: z.string().optional(),
});

/**
 * Message reactions schema
 */
export const messageReactionSchema = z.object({
  type: z.enum(['like', 'heart', 'laugh', 'wow', 'sad', 'angry']),
});

/**
 * Conversation participants schema
 */
export const conversationParticipantsSchema = z.object({
  add: z.array(z.string()).optional(),
  remove: z.array(z.string()).optional(),
}).refine(
  data => (data.add?.length ?? 0) + (data.remove?.length ?? 0) > 0,
  'Must specify at least one participant to add or remove'
);

// Export type definitions
export type CreateConversationRequest = z.infer<typeof createConversationSchema>;
export type UpdateConversationRequest = z.infer<typeof updateConversationSchema>;
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export type GetMessagesRequest = z.infer<typeof getMessagesSchema>;
export type SearchConversationsRequest = z.infer<typeof searchConversationsSchema>;
export type SearchMessagesRequest = z.infer<typeof searchMessagesSchema>;
export type MessageReactionRequest = z.infer<typeof messageReactionSchema>;
export type ConversationParticipantsRequest = z.infer<typeof conversationParticipantsSchema>;