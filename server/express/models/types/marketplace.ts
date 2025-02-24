import { Role } from './Role';

// Product condition type
export type ProductCondition = 'new' | 'used';
export type ProductConditionFilter = ProductCondition | 'all';

export interface BaseProduct {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  condition: ProductCondition;
  images?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface ProductCreate extends BaseProduct {
  sellerId: string;
}

export interface ProductUpdate extends Partial<BaseProduct> {
  id: string;
}

export interface Product extends Required<BaseProduct> {
  id: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  seller: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ProductQuery {
  id?: string;
  categoryId?: string;
  sellerId?: string;
  condition?: ProductConditionFilter;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'date' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId: string;
  condition: ProductCondition;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    name: string;
  };
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
}

// Types for search functionality
export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  radius?: number;  // in meters
  sellerId?: string;
  condition?: ProductConditionFilter;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface SearchOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'date' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  includeCategory?: boolean;
  includeSeller?: boolean;
}

// Search result facets
export interface CategoryFacet {
  id: string;
  name: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
  count: number;
}

export interface SellerFacet {
  id: string;
  name: string;
  count: number;
}

export interface SearchFacets {
  categories: CategoryFacet[];
  priceRanges: PriceRange[];
  sellers: SellerFacet[];
}

// Enhanced search response
export interface SearchResponse extends ProductListResponse {
  facets: SearchFacets;
}