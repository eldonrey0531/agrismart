import { useApi, useApiMutation, useApiDelete } from './use-api';
import { ProductInput } from '@/lib/validations/form';
import { useQueryClient } from '@tanstack/react-query';

interface Product extends Omit<ProductInput, 'images'> {
  id: string;
  sellerId: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export function useProductApi() {
  const queryClient = useQueryClient();

  // Get products list with filters
  const getProducts = (filters: ProductFilters = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, String(value));
      }
    });

    return useApi<ProductsResponse>(
      ['products', JSON.stringify(filters)],
      `/products?${queryString.toString()}`
    );
  };

  // Get single product by ID
  const getProduct = (id: string) =>
    useApi<Product>(['product', id], `/products/${id}`);

  // Create new product
  const createProduct = useApiMutation<Product, ProductInput>('/products', {
    onSuccess: () => {
      // Invalidate products list cache
      queryClient.invalidateQueries(['products']);
    },
  });

  // Update existing product
  const updateProduct = (id: string) =>
    useApiMutation<Product, Partial<ProductInput>>(`/products/${id}`, {
      onSuccess: () => {
        // Invalidate both list and single product cache
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['product', id]);
      },
    });

  // Delete product
  const deleteProduct = (id: string) =>
    useApiDelete<{ message: string }>(`/products/${id}`, {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
      },
    });

  // Change product status
  const updateProductStatus = (id: string) =>
    useApiMutation<
      Product,
      {
        status: 'draft' | 'published' | 'archived';
      }
    >(`/products/${id}/status`, {
      onSuccess: () => {
        queryClient.invalidateQueries(['products']);
        queryClient.invalidateQueries(['product', id]);
      },
    });

  // Upload product images
  const uploadProductImages = (id: string) =>
    useApiMutation<
      { images: Array<{ url: string; alt: string }> },
      FormData
    >(`/products/${id}/images`, {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', id]);
      },
    });

  // Delete product image
  const deleteProductImage = (productId: string, imageId: string) =>
    useApiDelete<{ message: string }>(
      `/products/${productId}/images/${imageId}`,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['product', productId]);
        },
      }
    );

  // Get seller's products
  const getSellerProducts = (filters: ProductFilters = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, String(value));
      }
    });

    return useApi<ProductsResponse>(
      ['seller-products', JSON.stringify(filters)],
      `/seller/products?${queryString.toString()}`
    );
  };

  return {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    uploadProductImages,
    deleteProductImage,
    getSellerProducts,
  };
}

export default useProductApi;