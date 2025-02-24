import { Product, Category, User, ProductCondition } from './database';

// Query parameters
export interface ProductQuery {
  search?: string;
  categoryId?: string;
  sellerId?: string;
  condition?: ProductCondition | 'all';
  minPrice?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'date' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Create/Update types
export interface ProductCreate {
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

export interface ProductUpdate extends Partial<ProductCreate> {
  id: string;
}

// Response types
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
    name: string | null;
  };
  distance?: number;
}

export interface SearchResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
  facets: SearchFacets;
}

// Facet types
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

// Database operations
export interface ProductInclude {
  category?: boolean;
  seller?: {
    select: {
      id: boolean;
      name: boolean;
      email?: boolean;
    };
  };
}

export interface ProductSelect {
  id?: boolean;
  name?: boolean;
  description?: boolean;
  price?: boolean;
  categoryId?: boolean;
  sellerId?: boolean;
  condition?: boolean;
  images?: boolean;
  location?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  category?: boolean;
  seller?: {
    select: {
      id: boolean;
      name: boolean;
      email?: boolean;
    };
  };
}

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SEARCH_RADIUS = 10000; // 10km
export const MAX_SEARCH_RADIUS = 50000; // 50km

export const PRICE_RANGES = [
  { min: 0, max: 100 },
  { min: 100, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000, max: Infinity }
] as const;

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP'
  }).format(price);
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};