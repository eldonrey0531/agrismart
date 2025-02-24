import { Prisma, Product, Category, User, Order, Review } from '@prisma/client';

// Base types with relations
export type ProductWithSeller = Product & {
  seller: {
    id: string;
    name: string;
    rating: number;
  };
};

export type CategoryWithRelations = Category & {
  _count: {
    products: number;
  };
  parent?: Pick<Category, 'id' | 'name'>;
  children: Array<CategoryWithCount>;
};

export type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};

// Response types
export interface CategoryResponse {
  categories: CategoryWithRelations[];
  total: number;
  topLevel: CategoryWithRelations[];
  hasChildren: CategoryWithRelations[];
}

export interface TrendingProducts {
  topViewed: ProductWithSeller[];
  topRated: ProductWithSeller[];
  recentSales: ProductWithSeller[];
  featured: ProductWithSeller[];
}

// Query types
export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  priceRange: {
    min: number;
    max: number;
  };
  brands: Array<{
    name: string;
    count: number;
  }>;
  ratings: Array<{
    value: number;
    count: number;
  }>;
}

export interface CategoryStats {
  id: string;
  name: string;
  productCount: number;
  averagePrice: number;
  totalSales: number;
}

export interface MarketplaceStats {
  totalProducts: number;
  totalSellers: number;
  activeListings: number;
  categoryStats: CategoryStats[];
  recentTransactions: number;
  trendingCategories: string[];
}

// Order types
export interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface SellerStats extends OrderStats {
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  followers: number;
}

// Review types
export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  product: {
    id: string;
    title: string;
  };
}

// Request types
export interface CreateReviewInput {
  rating: number;
  comment: string;
  orderId?: string;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  images?: string[];
  isActive?: boolean;
}

// Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Cache keys
export const CACHE_KEYS = {
  FEATURED_PRODUCTS: 'featured:products',
  CATEGORIES: 'marketplace:categories',
  TRENDING_PRODUCTS: 'trending:products',
  SELLER_PROFILE: (id: string) => `seller:${id}:profile`,
  SELLER_PRODUCTS: (id: string, page: number) => `seller:${id}:products:${page}`,
  SEARCH_RESULTS: (query: string) => `search:${query}`,
  CATEGORY_STATS: 'category:stats',
  PRODUCT_FILTERS: (category?: string) => `filters:${category || 'all'}`
} as const;

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TTL = 3600; // 1 hour
export const MAX_FEATURED_PRODUCTS = 10;
export const MAX_TRENDING_PRODUCTS = 20;
export const MIN_SEARCH_CHARS = 2;

// Database select types
export const productWithSellerSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  stock: true,
  category: true,
  images: true,
  rating: true,
  views: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      name: true,
      rating: true
    }
  }
} as const;

export type ProductWithSellerSelect = Prisma.ProductSelect & {
  seller: {
    select: {
      id: boolean;
      name: boolean;
      rating: boolean;
    };
  };
};