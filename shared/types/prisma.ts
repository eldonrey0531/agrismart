import { Prisma } from '@prisma/client';

// Helper type for JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

// Product base type
type ProductBase = {
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isDigital: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  rating?: number;
  views?: number;
  attributes?: JsonValue;
};

// Create input types
type ProductCreateRelations = {
  seller: {
    connect: {
      id: string;
    };
  };
  categories: {
    connect: Array<{
      id: string;
    }>;
  };
};

export type ProductCreateInput = ProductBase & ProductCreateRelations;

// Update input types
type ProductUpdateOptional = {
  [K in keyof ProductBase]?: ProductBase[K];
};

type ProductUpdateRelations = {
  categories?: {
    set: Array<{
      id: string;
    }>;
  };
};

export type ProductUpdateInput = ProductUpdateOptional & ProductUpdateRelations;

// Product select type for queries
export type ProductSelect = {
  id: true;
  title: true;
  description: true;
  price: true;
  stock: true;
  isActive: true;
  isFeatured: true;
  isDigital: true;
  rating: true;
  views: true;
  images: true;
  createdAt: true;
  updatedAt: true;
  sellerId: true;
  attributes: true;
  seller: {
    select: {
      id: true;
      name: true;
      rating: true;
    };
  };
  categories: {
    select: {
      id: true;
      name: true;
      slug: true;
    };
  };
};

export const DEFAULT_PRODUCT_DATA = {
  rating: 0,
  views: 0,
  isActive: true,
  isFeatured: false,
  isDigital: false
} as const;

// Type guard for JsonValue
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  if (['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isJsonValue);
  }
  return false;
}