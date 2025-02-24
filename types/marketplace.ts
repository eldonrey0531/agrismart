/**
 * Product status enum
 */
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED'
}

/**
 * Base seller type
 */
export interface SellerInfo {
  id: string;
  name: string;
}

/**
 * Base product type
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  images?: string[];
  sellerId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Product with seller
 */
export interface ProductWithSeller extends Omit<Product, 'sellerId'> {
  seller: SellerInfo;
}

/**
 * Product create input
 */
export interface ProductCreateInput {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Product update input
 */
export type ProductUpdateInput = Partial<ProductCreateInput> & {
  status?: ProductStatus;
};

/**
 * Product list filters
 */
export interface ProductFilters {
  status?: ProductStatus;
  category?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'created_desc' | 'title_asc';
  page?: number;
  limit?: number;
}

/**
 * Product list response
 */
export interface ProductListResponse {
  products: ProductWithSeller[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Category base type
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

/**
 * Category with children
 */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

/**
 * Category create input
 */
export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

/**
 * Category update input
 */
export type CategoryUpdateInput = Partial<CategoryCreateInput>;

/**
 * API error detail
 */
export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
}

/**
 * Database include types
 */
export const DatabaseIncludes = {
  productWithSeller: {
    include: {
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  categoryWithChildren: {
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
  },
} as const;