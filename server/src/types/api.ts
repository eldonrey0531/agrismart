import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Product, User, Order, Review } from '@prisma/client';

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product types
export interface ProductQuery extends PaginationQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductResponse extends Product {
  seller: {
    id: string;
    name: string;
    rating: number;
  };
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  items: (CartItem & {
    product: ProductResponse;
  })[];
  total: number;
  itemCount: number;
}

// Order types
export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderResponse extends Order {
  items: {
    id: string;
    quantity: number;
    price: number;
    product: ProductResponse;
  }[];
}

// Review types
export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse extends Review {
  user: {
    id: string;
    name: string;
  };
}

// Type-safe request handlers
export interface TypedRequestBody<T> extends ExpressRequest {
  body: T;
}

export interface TypedRequestQuery<T> extends ExpressRequest {
  query: T;
}

export interface TypedRequestParams<T> extends ExpressRequest {
  params: T;
}

export interface TypedRequest<
  TBody = any,
  TQuery = any,
  TParams = any
> extends ExpressRequest {
  body: TBody;
  query: TQuery;
  params: TParams;
}

export interface TypedResponse<T = any> extends ExpressResponse {
  json(data: ApiResponse<T>): this;
}

// Common parameter types
export interface IdParam {
  id: string;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
}

// Search types
export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

// Statistics types
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  averageRating: number;
}

// Bulk operation types
export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// Custom type guards
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } => {
  return response.success && 'data' in response;
};

export const isErrorResponse = (
  response: ApiResponse
): response is ApiResponse & { error: NonNullable<ApiResponse['error']> } => {
  return !response.success && 'error' in response;
};