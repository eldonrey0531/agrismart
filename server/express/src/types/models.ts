import { UserRole } from './shared';

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  password: string;
  role: typeof UserRole[keyof typeof UserRole];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation model
 */
export interface Conversation {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message model
 */
export interface Message {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation participant model
 */
export interface ConversationParticipant {
  userId: string;
  conversationId: string;
  joinedAt: Date;
}