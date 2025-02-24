import { User } from "./auth";

export interface IMessage {
  id: string;
  sender: string;
  conversation: string;
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  attachments?: {
    id: string;
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
}

export interface IParticipant extends Pick<User, "id" | "name" | "avatar"> {
  isOnline?: boolean;
  lastSeen?: string;
}

export interface IConversation {
  id: string;
  participants: IParticipant[];
  lastMessage?: IMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  type: "direct" | "group";
}

// API Response Types
export interface IMessageResponse {
  success: boolean;
  message: IMessage;
}

export interface IConversationsResponse {
  success: boolean;
  conversations: IConversation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IMessagesResponse {
  success: boolean;
  messages: IMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Request Types
export interface SendMessageRequest {
  content: string;
  attachments?: File[];
}

export interface CreateConversationRequest {
  participants: string[];
  message?: string;
  type?: "direct" | "group";
}