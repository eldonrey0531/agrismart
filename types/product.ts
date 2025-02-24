export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'seeds' | 'tools' | 'equipment' | 'fertilizers' | 'pesticides' | 'others';
  images: string[];
  likes: number;
  status: 'active' | 'inactive' | 'deleted';
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
  location: {
    coordinates: [number, number];
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
    similarProducts: Product[];
  };
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: Product['category'];
  images: string[];
  location: {
    coordinates: [number, number];
    address: string;
  };
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: Product['status'];
}

export interface ProductFilters {
  search?: string;
  category?: Product['category'];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'likes';
  sortOrder?: 'asc' | 'desc';
  sellerId?: string;
  status?: Product['status'];
}

export interface ProductStats {
  totalProducts: number;
  totalActive: number;
  totalLikes: number;
  topCategories: Array<{
    category: Product['category'];
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
}