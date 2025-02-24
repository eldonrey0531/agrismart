import {
  CreateProductRequest,
  Product,
  ProductFilter,
  ProductResponse,
  UpdateProductRequest,
} from '../types/marketplace';

export class MarketplaceService {
  private static instance: MarketplaceService;
  private readonly baseUrl: string;
  private readonly expressUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.expressUrl = process.env.EXPRESS_API_URL || 'http://localhost:5001';
  }

  public static getInstance(): MarketplaceService {
    if (!MarketplaceService.instance) {
      MarketplaceService.instance = new MarketplaceService();
    }
    return MarketplaceService.instance;
  }

  // Get products with filtering
  public async getProducts(filters: ProductFilter): Promise<ProductResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add all filter parameters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.searchQuery) queryParams.append('q', filters.searchQuery);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      // Add location filters if present
      if (filters.location) {
        if (filters.location.country) queryParams.append('country', filters.location.country);
        if (filters.location.state) queryParams.append('state', filters.location.state);
        if (filters.location.city) queryParams.append('city', filters.location.city);
        if (filters.location.radius) queryParams.append('radius', filters.location.radius.toString());
        if (filters.location.coordinates) {
          queryParams.append('lat', filters.location.coordinates[1].toString());
          queryParams.append('lng', filters.location.coordinates[0].toString());
        }
      }

      const response = await fetch(`${this.expressUrl}/marketplace/products?${queryParams}`, {
        headers: this.getHeaders(),
      });

      return response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: { products: [], total: 0 },
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch products',
          details: { error: String(error) },
        },
      };
    }
  }

  // Get single product by ID
  public async getProduct(productId: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.expressUrl}/marketplace/products/${productId}`, {
        headers: this.getHeaders(),
      });

      return response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        data: {},
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch product',
          details: { error: String(error) },
        },
      };
    }
  }

  // Create new product
  public async createProduct(product: CreateProductRequest): Promise<ProductResponse> {
    try {
      const formData = new FormData();

      // Add product data
      formData.append('data', JSON.stringify(product));

      // Add images
      if (product.images) {
        product.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`image_${index}`, image);
          }
        });
      }

      const response = await fetch(`${this.expressUrl}/marketplace/products`, {
        method: 'POST',
        headers: this.getHeaders(false), // Don't set content-type for FormData
        body: formData,
      });

      return response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        data: {},
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create product',
          details: { error: String(error) },
        },
      };
    }
  }

  // Update existing product
  public async updateProduct(
    productId: string,
    updates: UpdateProductRequest
  ): Promise<ProductResponse> {
    try {
      const formData = new FormData();

      // Add update data
      formData.append('data', JSON.stringify(updates));

      // Add new images if any
      if (updates.images) {
        updates.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`image_${index}`, image);
          }
        });
      }

      const response = await fetch(`${this.expressUrl}/marketplace/products/${productId}`, {
        method: 'PATCH',
        headers: this.getHeaders(false), // Don't set content-type for FormData
        body: formData,
      });

      return response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        data: {},
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update product',
          details: { error: String(error) },
        },
      };
    }
  }

  // Delete product
  public async deleteProduct(productId: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.expressUrl}/marketplace/products/${productId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        data: {},
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete product',
          details: { error: String(error) },
        },
      };
    }
  }

  // Get seller's products
  public async getSellerProducts(sellerId: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.expressUrl}/marketplace/sellers/${sellerId}/products`, {
        headers: this.getHeaders(),
      });

      return response.json();
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return {
        success: false,
        data: { products: [], total: 0 },
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch seller products',
          details: { error: String(error) },
        },
      };
    }
  }

  // Helper method to get headers
  private getHeaders(includeContentType = true): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }
}

// Export singleton instance
export const marketplaceService = MarketplaceService.getInstance();