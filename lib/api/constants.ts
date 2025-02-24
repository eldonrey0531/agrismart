import { IMessage, IConversation } from "@/types/chat";
import { OrderStatus } from "@/types/marketplace";

// API Base URLs
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";

// API Endpoints
export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    REQUEST_RESET: "/auth/request-reset",
    RESET_PASSWORD: "/auth/reset-password",
    PROFILE: "/auth/profile",
  },

  // Chat
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    DIRECT: (userId: string) => `/chat/conversations/direct/${userId}`,
    DELETE_MESSAGE: (messageId: string) => `/chat/messages/${messageId}`,
    ARCHIVE: (conversationId: string) => `/chat/conversations/${conversationId}/archive`,
  },

  // Orders
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    DETAILS: (orderId: string) => `/orders/${orderId}`,
    UPDATE_STATUS: (orderId: string) => `/orders/${orderId}/status`,
    BUYER: "/orders/buyer",
    SELLER: "/orders/seller",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    DETAILS: (productId: string) => `/products/${productId}`,
    UPDATE: (productId: string) => `/products/${productId}`,
    DELETE: (productId: string) => `/products/${productId}`,
    SEARCH: "/products/search",
  },
} as const;

// API Request Types
export interface ApiRequest {
  // Auth
  "POST /auth/login": {
    body: { email: string; password: string; remember?: boolean };
    response: { success: true; user: any; tokens: any };
  };
  "POST /auth/register": {
    body: FormData;
    response: { success: true; user: any; tokens: any };
  };
  "POST /auth/refresh": {
    response: { success: true; user: any; tokens: any };
  };

  // Chat
  "POST /chat/conversations/:conversationId/messages": {
    body: { content: string };
    response: { success: true; message: IMessage };
  };
  "GET /chat/conversations": {
    query: { limit?: number; page?: number };
    response: { success: true; conversations: IConversation[] };
  };
  "GET /chat/conversations/:conversationId/messages": {
    query: { limit?: number; before?: string };
    response: { success: true; messages: IMessage[] };
  };

  // Orders
  "POST /orders": {
    body: {
      productId: string;
      quantity: number;
      shippingAddress: {
        street: string;
        city: string;
        state?: string;
        country: string;
        postalCode: string;
      };
      paymentMethod: string;
    };
    response: { success: true; orderId: string };
  };
  "PATCH /orders/:orderId/status": {
    body: { status: OrderStatus };
    response: { success: true };
  };

  // Common Error Response
  ErrorResponse: {
    success: false;
    error: string;
    details?: Record<string, any>;
  };
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;