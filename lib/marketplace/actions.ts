import { marketplaceApi } from '@/lib/shared/services/api-client';

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
}) {
  try {
    const queryString = new URLSearchParams();
    if (params?.search) queryString.append('search', params.search);
    if (params?.category) queryString.append('category', params.category);
    if (params?.page) queryString.append('page', params.page.toString());

    const response = await marketplaceApi.get(`/products?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function createProduct(productData: {
  name: string;
  description: string;
  price: number;
  category: string;
}) {
  try {
    const response = await marketplaceApi.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}