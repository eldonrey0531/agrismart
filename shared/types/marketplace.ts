import { AttributeType } from './marketplace-data';
import { SocketEvent } from './socket';

export enum MarketplaceEvent {
  SEARCH = 'marketplace:search',
  SEARCH_RESULT = 'marketplace:search_result',
  PRODUCT_CREATE = 'marketplace:product_create',
  PRODUCT_UPDATE = 'marketplace:product_update',
  PRODUCT_DELETE = 'marketplace:product_delete',
  CATEGORY_UPDATE = 'marketplace:category_update',
  CATEGORY_DELETE = 'marketplace:category_delete',
  ERROR = 'marketplace:error'
}

export interface MarketplaceProductAttribute {
  id: string;
  name: string;
  value: string;
  type: AttributeType;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  rating: number;
  views: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  attributes: MarketplaceProductAttribute[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface MarketplaceFilterOptions {
  categoryIds?: string[];
  priceRange?: PriceRange;
  attributes?: Record<string, string[]>;
  rating?: number;
  isFeatured?: boolean;
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc' | 'created_desc';
}

export interface RequiredMarketplaceFilterOptions {
  categoryIds: string[];
  priceRange: PriceRange | undefined;
  attributes: Record<string, string[]>;
  rating: number | undefined;
  isFeatured: boolean | undefined;
  query: string;
  page: number;
  pageSize: number;
  sortBy: MarketplaceFilterOptions['sortBy'];
}

export interface MarketplaceSearchResult {
  items: MarketplaceProduct[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type CreateProductData = {
  title: string;
  description: string;
  price: number;
  stock: number;
  isDigital: boolean;
  images: string[];
  categoryIds: string[];
  attributes: MarketplaceProductAttribute[];
};

export type UpdateProductData = Partial<CreateProductData>;

export interface MarketplaceResponse<T> {
  success: true;
  data: T;
}

export interface MarketplaceErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: any;
}

// Socket event type mapping
export interface MarketplaceEventMap {
  [MarketplaceEvent.SEARCH]: MarketplaceFilterOptions;
  [MarketplaceEvent.SEARCH_RESULT]: MarketplaceResponse<MarketplaceSearchResult>;
  [MarketplaceEvent.PRODUCT_CREATE]: MarketplaceResponse<MarketplaceProduct>;
  [MarketplaceEvent.PRODUCT_UPDATE]: MarketplaceResponse<MarketplaceProduct>;
  [MarketplaceEvent.PRODUCT_DELETE]: MarketplaceResponse<{ id: string }>;
  [MarketplaceEvent.CATEGORY_UPDATE]: MarketplaceResponse<{ id: string }>;
  [MarketplaceEvent.CATEGORY_DELETE]: MarketplaceResponse<{ id: string }>;
  [MarketplaceEvent.ERROR]: MarketplaceErrorResponse;
}

// Extend SocketEvent enum
declare module './socket' {
  interface SocketEventMap extends MarketplaceEventMap {}
}