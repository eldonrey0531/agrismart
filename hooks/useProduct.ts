import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import {
  Product,
  ProductFilterOptions,
  ProductSearchResult,
  CreateProductData,
  UpdateProductData,
  ProductEventPayload
} from '../shared/types/product';

export function useProduct() {
  const { socket, emit } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResult, setSearchResult] = useState<ProductSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const searchProducts = useCallback((filters: ProductFilterOptions) => {
    setLoading(true);
    emit('product:search', filters);
  }, [emit]);

  // CRUD Operations
  const createProduct = useCallback((data: CreateProductData) => {
    setLoading(true);
    emit('product:create', data);
  }, [emit]);

  const updateProduct = useCallback((data: UpdateProductData) => {
    setLoading(true);
    emit('product:update', data);
  }, [emit]);

  const deleteProduct = useCallback((id: string) => {
    setLoading(true);
    emit('product:delete', id);
  }, [emit]);

  const viewProduct = useCallback((id: string) => {
    emit('product:view', id);
  }, [emit]);

  // Event Handlers
  const handleSearchResult = useCallback((result: ProductSearchResult) => {
    setSearchResult(result);
    setLoading(false);
  }, []);

  const handleProductEvent = useCallback((payload: ProductEventPayload) => {
    setProducts(prev => {
      switch (payload.type) {
        case 'created':
          return [payload.product, ...prev];
        
        case 'updated':
          return prev.map(p => 
            p.id === payload.product.id ? payload.product : p
          );
        
        case 'deleted':
          return prev.filter(p => p.id !== payload.product.id);
        
        default:
          return prev;
      }
    });
    setLoading(false);
  }, []);

  const handleError = useCallback((error: string) => {
    setError(error);
    setLoading(false);
  }, []);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('product:result', handleSearchResult);
    socket.on('product:event', handleProductEvent);
    socket.on('error', handleError);

    return () => {
      socket.off('product:result');
      socket.off('product:event');
      socket.off('error');
    };
  }, [socket, handleSearchResult, handleProductEvent, handleError]);

  // Pagination helpers
  const loadMore = useCallback(() => {
    if (!searchResult || !searchResult.hasMore) return;
    
    searchProducts({
      ...searchResult,
      page: (searchResult.page || 0) + 1
    });
  }, [searchResult, searchProducts]);

  // Real-time stock update helper
  const updateStock = useCallback((productId: string, quantity: number) => {
    emit('product:update', {
      id: productId,
      data: {
        stock: quantity
      }
    });
  }, [emit]);

  return {
    products,
    searchResult,
    loading,
    error,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    viewProduct,
    loadMore,
    updateStock
  };
}