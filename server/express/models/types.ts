import { Types } from "mongoose";
import { User as UserModel } from "./User";
import { Message as MessageModel } from "./Message";
import { Conversation as ConversationModel } from "./Conversation";

// Common Types
export type ObjectId = Types.ObjectId;

// Authentication Types
export type UserRole = "user" | "admin" | "moderator";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  type: "access" | "refresh" | "verification" | "passwordReset";
  iat?: number;
  exp?: number;
}

// User Types
export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string;
}

// Message Types
export type MessageType = "text" | "image" | "file" | "system";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export interface MessageMetadata {
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MessageEditHistory {
  content: string;
  editedAt: Date;
}

// Conversation Types
export type ConversationType = "direct" | "group";

export interface ConversationParticipant {
  user: Types.ObjectId | typeof UserModel;
  joinedAt: Date;
  lastRead?: Date;
  isActive: boolean;
}

export interface ConversationMetadata {
  icon?: string;
  description?: string;
  customProperties?: Record<string, any>;
}

// Error Responses
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Query Types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface MessageQueryOptions {
  limit?: number;
  before?: Date;
  after?: Date;
  type?: MessageType;
  status?: MessageStatus;
}

export interface ConversationQueryOptions extends PaginationOptions {
  type?: ConversationType;
  searchTerm?: string;
  participantId?: Types.ObjectId;
  isActive?: boolean;
}

// Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MessageResponse {
  id: string;
  conversation: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: MessageType;
  status: MessageStatus;
  metadata?: MessageMetadata;
  replyTo?: string;
  editHistory?: MessageEditHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationResponse {
  id: string;
  title?: string;
  type: ConversationType;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    lastRead?: Date;
    isActive: boolean;
  }[];
  lastMessage?: MessageResponse;
  metadata?: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Model References
export interface ModelReferences {
  User: typeof UserModel;
  Message: typeof MessageModel;
  Conversation: typeof ConversationModel;
}

// Websocket Event Types
export type ChatEventType = 
  | "message.new"
  | "message.update"
  | "message.delete"
  | "message.status"
  | "conversation.new"
  | "conversation.update"
  | "conversation.delete"
  | "participant.join"
  | "participant.leave"
  | "participant.status";

export interface ChatEvent<T = any> {
  type: ChatEventType;
  payload: T;
  timestamp: Date;
  sender?: string;
}

// Export model types
export type {
  UserModel as User,
  MessageModel as Message,
  ConversationModel as Conversation,
};
