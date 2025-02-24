/**
 * Shared type definitions between frontend and backend
 * These types should be kept in sync with frontend's type definitions
 */

// Location type standardization
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  radius?: number;              // Search radius in kilometers
}

// Category types
export enum ProductCategory {
  VEGETABLES = 'VEGETABLES',
  FRUITS = 'FRUITS',
  GRAINS = 'GRAINS',
  LIVESTOCK = 'LIVESTOCK',
  POULTRY = 'POULTRY',
  FISH = 'FISH',
  SEEDS = 'SEEDS',
  EQUIPMENT = 'EQUIPMENT',
  FERTILIZER = 'FERTILIZER',
  OTHER = 'OTHER'
}

// Product validation limits
export const PRODUCT_VALIDATION = {
  title: {
    min: 3,
    max: 100
  },
  description: {
    min: 10,
    max: 2000
  },
  price: {
    min: 0,
    max: 999999.99
  },
  quantity: {
    min: 0,
    max: 999999
  },
  images: {
    min: 1,
    max: 5,
    types: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }
} as const;

// Error codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST'
}

// Shared error response type
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: {
      field: string;
      message: string;
    }[];
  };
}

// Shared API response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

// Product interfaces
export interface ProductBase {
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: ProductCategory;
  location: GeoLocation;
  images: string[];
}

export interface ProductCreate extends ProductBase {
  sellerId: string;
}

export interface ProductUpdate extends Partial<ProductBase> {
  id: string;
}

export interface ProductQuery {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: GeoLocation;
  sortBy?: keyof ProductBase;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Route params type
export interface RouteParams {
  id: string;
  [key: string]: string | undefined;
}

// File upload types
export interface FileUploadResponse {
  fileId: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadError {
  fileName: string;
  error: string;
}

export interface FileUploadResult {
  successful: FileUploadResponse[];
  failed: FileUploadError[];
}