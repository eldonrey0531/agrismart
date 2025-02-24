import { z } from "zod";
import { Types } from "mongoose";

// Helper function to validate MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const isValidObjectId = (value: string) => objectIdRegex.test(value);

// Create direct chat validation
export const createDirectChatSchema = z.object({
  recipientId: z
    .string()
    .refine(isValidObjectId, "Invalid recipient ID format")
});

// Send message validation
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
  type: z
    .enum(["text", "image", "file", "system"] as const)
    .default("text"),
  metadata: z
    .object({
      fileUrl: z.string().url().optional(),
      fileName: z.string().optional(),
      fileSize: z.number().positive().optional(),
      mimeType: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      duration: z.number().positive().optional(),
    })
    .optional(),
  replyTo: z
    .string()
    .refine(isValidObjectId, "Invalid message ID format")
    .optional(),
});

// Get messages query validation
export const getMessagesSchema = z.object({
  before: z
    .string()
    .datetime()
    .optional(),
  after: z
    .string()
    .datetime()
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default("50"),
});

// Edit message validation
export const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
});

// Message search validation
export const searchMessagesSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query is too long"),
  conversationId: z
    .string()
    .refine(isValidObjectId, "Invalid conversation ID format")
    .optional(),
  type: z
    .enum(["text", "image", "file", "system"] as const)
    .optional(),
  from: z
    .string()
    .datetime()
    .optional(),
  to: z
    .string()
    .datetime()
    .optional(),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20),
});

// Update conversation validation
export const updateConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title is too long")
    .optional(),
  metadata: z
    .object({
      icon: z.string().url().optional(),
      description: z.string().max(500).optional(),
      customProperties: z.record(z.any()).optional(),
    })
    .optional(),
});

// Add participant validation
export const participantSchema = z.object({
  userId: z
    .string()
    .refine(isValidObjectId, "Invalid user ID format"),
});

// Infer types from schemas
export type CreateDirectChatInput = z.infer<typeof createDirectChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ParticipantInput = z.infer<typeof participantSchema>;

export default {
  createDirectChatSchema,
  sendMessageSchema,
  getMessagesSchema,
  editMessageSchema,
  searchMessagesSchema,
  updateConversationSchema,
  participantSchema,
};