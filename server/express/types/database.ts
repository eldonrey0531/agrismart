import { Prisma } from '@prisma/client';

// Basic model types
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export type UserRole = 'USER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface User extends BaseModel {
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  password: string;
}

// Product types
export type ProductCondition = 'new' | 'used';
export type SortOrder = 'asc' | 'desc';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Product extends BaseModel {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId: string;
  condition: ProductCondition;
  images: string[];
  location?: GeoPoint;
  category?: Category;
  seller?: User;
}

// Category types
export interface Category extends BaseModel {
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  order: number;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

// Query filters
export interface StringFilter {
  equals?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'insensitive' | 'sensitive';
}

export interface NumberFilter {
  equals?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
}

export interface DateTimeFilter {
  equals?: Date;
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
}

export interface GeoFilter {
  near: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}

export interface ProductWhereInput {
  id?: string | StringFilter;
  name?: string | StringFilter;
  description?: string | StringFilter;
  price?: number | NumberFilter;
  categoryId?: string | StringFilter;
  sellerId?: string | StringFilter;
  condition?: ProductCondition;
  location?: GeoFilter;
  createdAt?: Date | DateTimeFilter;
  updatedAt?: Date | DateTimeFilter;
  AND?: ProductWhereInput[];
  OR?: ProductWhereInput[];
  NOT?: ProductWhereInput;
}

export interface ProductOrderByInput {
  id?: SortOrder;
  name?: SortOrder;
  description?: SortOrder;
  price?: SortOrder;
  categoryId?: SortOrder;
  sellerId?: SortOrder;
  condition?: SortOrder;
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  distance?: SortOrder;
  _relevance?: SortOrder;
}

// Select types
export interface BaseSelect {
  [key: string]: boolean | { select: BaseSelect };
}

export interface UserSelect extends BaseSelect {
  id?: boolean;
  name?: boolean;
  email?: boolean;
}

export interface CategorySelect extends BaseSelect {
  id?: boolean;
  name?: boolean;
  description?: boolean;
}

export interface ProductSelect extends BaseSelect {
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
  category?: boolean | { select: CategorySelect };
  seller?: boolean | { select: UserSelect };
}

// Group by types
export interface GroupCount {
  _count: number;
}

export interface CategoryGroupBase {
  categoryId: string;
}

export interface PriceGroupBase {
  price: number;
}

export interface SellerGroupBase {
  sellerId: string;
}

export type CategoryGroup = CategoryGroupBase & GroupCount;
export type PriceGroup = PriceGroupBase & GroupCount;
export type SellerGroup = SellerGroupBase & GroupCount;

export type CategoryGroupResult = CategoryGroup;
export type PriceGroupResult = PriceGroup;
export type SellerGroupResult = SellerGroup;

// Query builder functions
export const createProductSelect = (
  includeCategory: boolean = false,
  includeSeller: boolean = false
): ProductSelect => ({
  id: true,
  name: true,
  description: true,
  price: true,
  images: true,
  condition: true,
  sellerId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  ...(includeCategory && {
    category: {
      select: {
        id: true,
        name: true
      }
    }
  }),
  ...(includeSeller && {
    seller: {
      select: {
        id: true,
        name: true
      }
    }
  })
});

// Helper function to ensure all properties of T are defined
export const ensureRequired = <T extends object, K extends keyof T>(
  obj: T,
  props: K[]
): obj is T & Required<Pick<T, K>> => {
  return props.every(prop => obj[prop] !== undefined);
};

// Export constants
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SEARCH_RADIUS = 10000; // 10km in meters