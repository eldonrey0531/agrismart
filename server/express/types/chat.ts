import { z } from "zod";
import { RequestHandler } from "express";

// Basic parameter types
export type ChatParams = {
  conversationId?: string;
  messageId?: string;
  userId?: string;
  [key: string]: string | undefined;
};

// Helper for converting string to number with default
const createNumberFromString = (defaultValue: number) =>
  z.string()
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? defaultValue : num;
    })
    .default(String(defaultValue));

// Base query params with pagination
export const paginationSchema = z.object({
  limit: createNumberFromString(50),
  before: z.string().optional(),
  after: z.string().optional(),
});

// Message query params
export const messageQuerySchema = paginationSchema.extend({
  type: z.enum(["text", "image", "file", "system"]).optional(),
});

// Search query params
export const searchQuerySchema = z.object({
  query: z.string(),
  conversationId: z.string().optional(),
  type: z.enum(["text", "image", "file", "system"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: createNumberFromString(20),
});

// Message content
export const messageMetadataSchema = z.object({
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
}).optional();

export const messageSchema = z.object({
  type: z.enum(["text", "image", "file", "system"]),
  content: z.string(),
  metadata: messageMetadataSchema,
  replyTo: z.string().optional(),
}).required();

// Direct chat creation
export const createDirectChatSchema = z.object({
  recipientId: z.string(),
}).required();

// Participant schema
export const participantSchema = z.object({
  userId: z.string(),
}).required();

// Conversation settings
export const conversationSettingsSchema = z.object({
  title: z.string().optional(),
  metadata: z.object({
    icon: z.string().optional(),
    description: z.string().optional(),
    customProperties: z.record(z.any()).optional(),
  }).optional(),
}).required();

// Types inferred from schemas
export type MessageQuery = z.infer<typeof messageQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Message = z.infer<typeof messageSchema>;
export type DirectChatRequest = z.infer<typeof createDirectChatSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type ConversationSettings = z.infer<typeof conversationSettingsSchema>;

// Chat controller handler type
export type ChatHandler = RequestHandler;

// Export all schemas
export const schemas = {
  pagination: paginationSchema,
  messageQuery: messageQuerySchema,
  search: searchQuerySchema,
  message: messageSchema,
  createDirectChat: createDirectChatSchema,
  participant: participantSchema,
  conversationSettings: conversationSettingsSchema,
};

export default schemas;