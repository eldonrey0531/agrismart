import { AuthenticatedRequest } from "./express";
import { Request } from "express";
import { ParsedQs } from "qs";

// Request Parameters
export interface ChatMessageParams {
  conversationId: string;
}

export interface ChatQueryParams extends ParsedQs {
  page?: string;
  limit?: string;
}

export interface CreateConversationBody {
  participants: string[];
  type?: "direct" | "group";
  message?: string;
}

// Request Types
export type GetConversationsRequest = AuthenticatedRequest<{}, any, any, ChatQueryParams>;
export type GetMessagesRequest = AuthenticatedRequest<ChatMessageParams, any, any, ChatQueryParams>;
export type CreateConversationRequest = AuthenticatedRequest<{}, any, CreateConversationBody>;

// Message Types
export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface MessageData {
  sender: string;
  conversation: string;
  content: string;
  readBy: string[];
  attachments?: MessageAttachment[];
}

// Response Types
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: any[]; // Replace with proper Conversation type
  pagination: PaginationData;
}

export interface MessagesResponse {
  success: boolean;
  messages: any[]; // Replace with proper Message type
  pagination: PaginationData;
}

export interface ConversationResponse {
  success: boolean;
  conversation: any; // Replace with proper Conversation type
}

// Socket Message Types
export interface SocketMessageData {
  conversationId: string;
  content: string;
  attachments?: Express.Multer.File[];
}