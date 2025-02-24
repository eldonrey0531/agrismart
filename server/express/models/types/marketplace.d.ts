export interface BaseProduct {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  condition: 'new' | 'used';
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
  condition?: 'new' | 'used';
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
  condition: 'new' | 'used';
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

export type ProductListResponse = {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
}