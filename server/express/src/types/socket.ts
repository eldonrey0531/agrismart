import { Message } from "../models/Chat";
import { AuthUser } from "./role";

export interface ServerToClientEvents {
  message: (message: Message) => void;
  typing: (event: TypingEvent) => void;
  presence: (event: PresenceEvent) => void;
  connect_error: (error: ConnectionError) => void;
}

export interface ClientToServerEvents {
  join: (conversationId: string) => void;
  leave: (conversationId: string) => void;
  typing: (event: { conversationId: string; isTyping: boolean }) => void;
  message: (data: {
    conversationId: string;
    content: string;
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      data: Buffer;
    }>;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: AuthUser;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ConnectionError {
  type: string;
  message: string;
  details?: Record<string, any>;
}

export interface SocketAuthPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Helper type for enforcing type safety in middleware
export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => void;

// Re-export Socket type with our custom events
import { Socket as SocketIOSocket } from "socket.io";
export type Socket = SocketIOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;