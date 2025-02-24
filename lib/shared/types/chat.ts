import { z } from 'zod';

// User types for chat participants
export const ChatUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  status: z.enum(['online', 'offline', 'away']).optional(),
});

export type ChatUser = z.infer<typeof ChatUserSchema>;

// Message types
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  sender: ChatUserSchema,
  content: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    type: z.enum(['image', 'document', 'other']),
    filename: z.string(),
    size: z.number(),
  })).optional(),
  readBy: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Conversation types
export const ConversationSchema = z.object({
  id: z.string(),
  type: z.enum(['direct', 'group']),
  participants: z.array(ChatUserSchema),
  lastMessage: MessageSchema.optional(),
  name: z.string().optional(), // Required for group chats
  avatar: z.string().optional(), // Required for group chats
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  archived: z.boolean().default(false),
  archiveDate: z.string().datetime().optional(),
  unreadCount: z.number().default(0),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// API request/response types
export const GetConversationsRequestSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(20),
  page: z.number().min(1).optional().default(1),
  archived: z.boolean().optional(),
});

export type GetConversationsRequest = z.infer<typeof GetConversationsRequestSchema>;

export const GetMessagesRequestSchema = z.object({
  conversationId: z.string(),
  limit: z.number().min(1).max(50).optional().default(50),
  before: z.string().datetime().optional(),
});

export type GetMessagesRequest = z.infer<typeof GetMessagesRequestSchema>;

export const SendMessageRequestSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    file: z.any(), // File type handled by multer
  })).max(5).optional(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

// WebSocket event types
export const ChatEventSchema = z.object({
  type: z.enum([
    'message.new',
    'message.update',
    'message.delete',
    'conversation.new',
    'conversation.update',
    'conversation.archive',
    'user.status',
  ]),
  payload: z.any(), // Specific payload types defined by event type
  timestamp: z.string().datetime(),
});

export type ChatEvent = z.infer<typeof ChatEventSchema>;

// Error types
export const ChatErrorSchema = z.object({
  code: z.enum([
    'CONVERSATION_NOT_FOUND',
    'MESSAGE_NOT_FOUND',
    'UNAUTHORIZED',
    'VALIDATION_ERROR',
    'RATE_LIMIT_EXCEEDED',
    'INTERNAL_ERROR',
  ]),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ChatError = z.infer<typeof ChatErrorSchema>;