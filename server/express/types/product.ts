import { Prisma } from '@prisma/client';

// Basic filter types
type StringFilter = {
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'default' | 'insensitive';
};

type NumberFilter = {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
};

type DateTimeFilter = {
  equals?: Date | string;
  in?: Date[] | string[];
  notIn?: Date[] | string[];
  lt?: Date | string;
  lte?: Date | string;
  gt?: Date | string;
  gte?: Date | string;
};

type JsonFilter = {
  equals?: any;
  path?: string[];
  string_contains?: string;
  array_contains?: any;
  near?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
};

type SortOrder = 'asc' | 'desc';

// Product specific types
export type ProductBaseWhereInput = {
  id?: string | StringFilter;
  name?: string | StringFilter;
  description?: string | StringFilter;
  price?: number | NumberFilter;
  categoryId?: string | StringFilter;
  sellerId?: string | StringFilter;
  condition?: string | StringFilter;
  location?: JsonFilter;
  createdAt?: Date | DateTimeFilter;
  updatedAt?: Date | DateTimeFilter;
};

export type ProductOrderByInput = {
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
  seller?: {
    id?: SortOrder;
    name?: SortOrder;
  };
  category?: {
    id?: SortOrder;
    name?: SortOrder;
  };
};

export type ProductInclude = {
  seller?: boolean;
  category?: boolean;
};

// Augment Prisma namespace
declare module '@prisma/client' {
  namespace Prisma {
    export type ProductWhereInput = ProductBaseWhereInput & {
      AND?: ProductBaseWhereInput | ProductBaseWhereInput[];
      OR?: ProductBaseWhereInput[];
      NOT?: ProductBaseWhereInput | ProductBaseWhereInput[];
    };

    export type ProductOrderByWithRelationInput = ProductOrderByInput;
  }
}

// Export types with Prisma namespace
export type { Prisma };