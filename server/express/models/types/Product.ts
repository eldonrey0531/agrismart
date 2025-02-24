import { Role } from './Role';

export interface ProductBase {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId: string;
  condition: 'new' | 'used';
  images: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends ProductBase {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  seller: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  condition: 'new' | 'used';
  images?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UpdateProductData extends Partial<Omit<CreateProductData, 'sellerId'>> {
  // Add any additional fields that can be updated
  id: string;
}

export interface ProductQueryFilters {
  categoryId?: string;
  sellerId?: string;
  condition?: 'new' | 'used' | 'all';
  minPrice?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  sortBy?: 'price' | 'date' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Type for Prisma operations
export type ProductCreateInput = Omit<CreateProductData, 'images'> & {
  images?: string[];
  seller: {
    connect: {
      id: string;
    };
  };
  category: {
    connect: {
      id: string;
    };
  };
};

export type ProductUpdateInput = Partial<Omit<CreateProductData, 'sellerId' | 'categoryId'>> & {
  images?: string[];
  category?: {
    connect: {
      id: string;
    };
  };
};