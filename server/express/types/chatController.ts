import { Request, Response, NextFunction } from "express";
import { Message, DirectChatRequest, ConversationSettings, Participant } from "./chat";
import { BaseParams } from "../routes/base";

/**
 * Chat route parameter types
 */
export interface ConversationParams extends BaseParams {
  conversationId: string;
}

export interface MessageParams extends BaseParams {
  messageId: string;
}

export interface UserParams extends BaseParams {
  userId: string;
}

export interface ConversationUserParams extends BaseParams {
  conversationId: string;
  userId: string;
}

/**
 * Chat request types
 */
export type ChatRequest<P extends BaseParams = BaseParams, B = any> = Request<P, any, B>;
export type ChatResponse = Response;

/**
 * Chat handler type
 */
export type ChatHandler<P extends BaseParams = BaseParams, B = any> = (
  req: ChatRequest<P, B>,
  res: ChatResponse,
  next: NextFunction
) => Promise<void>;

/**
 * Chat controller interface
 */
export interface ChatController {
  getOrCreateDirectChat: ChatHandler<{}, DirectChatRequest>;
  getConversations: ChatHandler;
  getMessages: ChatHandler<ConversationParams>;
  sendMessage: ChatHandler<ConversationParams, Message>;
  editMessage: ChatHandler<MessageParams, Pick<Message, "content">>;
  markMessageAsRead: ChatHandler<MessageParams>;
  searchMessages: ChatHandler;
  updateConversation: ChatHandler<ConversationParams, ConversationSettings>;
  addParticipant: ChatHandler<ConversationParams, Participant>;
  removeParticipant: ChatHandler<ConversationUserParams>;
}

/**
 * Route schema validation
 */
export interface RouteSchema<B = any> {
  params?: Record<string, any>;
  body?: B;
  query?: Record<string, any>;
}

/**
 * Route configuration
 */
export interface ChatRouteConfig<P extends BaseParams = BaseParams, B = any> {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  handler: ChatHandler<P, B>;
  schema?: RouteSchema<B>;
}

/**
 * Helper function to wrap handlers with type safety
 */
export const wrapChatHandler = <P extends BaseParams = BaseParams, B = any>(
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
): ChatHandler<P, B> => {
  return async (
    req: ChatRequest<P, B>,
    res: ChatResponse,
    next: NextFunction
  ): Promise<void> => {
    try {
      await Promise.resolve(handler(req as Request<P>, res, next));
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Type-safe parameter creators
 */
export const createParams = {
  conversation: (id: string): ConversationParams => ({ conversationId: id }),
  message: (id: string): MessageParams => ({ messageId: id }),
  user: (id: string): UserParams => ({ userId: id }),
  conversationUser: (conversationId: string, userId: string): ConversationUserParams => ({
    conversationId,
    userId,
  }),
};

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
    total?: number;
  };
}

/**
 * Validation types
 */
export interface ValidationOptions {
  location: "body" | "query" | "params";
}

export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}