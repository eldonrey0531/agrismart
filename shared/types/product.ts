export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  COLOR = 'COLOR',
  SIZE = 'SIZE'
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  rating: number;
  views: number;
  categories: ProductCategory[];
  attributes: ProductAttributeValue[];
  images: string[];
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  children?: ProductCategory[];
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: AttributeType;
  options: string[];
  isRequired: boolean;
  isFilter: boolean;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  productId: string;
  attributeId: string;
  attribute: ProductAttribute;
}

export interface ProductFilterOptions {
  categories?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  attributes?: {
    [attributeId: string]: string | string[];
  };
  rating?: number;
  isFeatured?: boolean;
  isDigital?: boolean;
  sortBy?: ProductSortOption;
  search?: string;
  page?: number;
  pageSize?: number;
}

export enum ProductSortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
  POPULARITY = 'popularity'
}

export interface ProductStats {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalViews: number;
  stockLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isDigital?: boolean;
  categoryIds: string[];
  attributes: {
    attributeId: string;
    value: string;
  }[];
  images: string[];
}

export interface UpdateProductData {
  id: string;
  data: Partial<CreateProductData>;
}

export interface ProductSearchResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProductEventPayload {
  type: 'created' | 'updated' | 'deleted';
  product: Product;
}

export interface ProductSocketEvents {
  'product:create': (data: CreateProductData) => void;
  'product:update': (data: UpdateProductData) => void;
  'product:delete': (id: string) => void;
  'product:view': (id: string) => void;
  'product:search': (filters: ProductFilterOptions) => void;
  'product:result': (result: ProductSearchResult) => void;
  'product:event': (payload: ProductEventPayload) => void;
}