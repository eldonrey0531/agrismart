import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { SocketEventHandler } from '../types/socket';
import {
  MarketplaceEvent,
  MarketplaceFilterOptions,
  MarketplaceProduct,
  MarketplaceResponse,
  MarketplaceErrorResponse,
  MarketplaceSearchResult,
  CreateProductData,
  UpdateProductData
} from '../shared/types/marketplace';

export interface UseMarketplaceOptions {
  onError?: (error: MarketplaceErrorResponse) => void;
  onSearchResult?: (result: MarketplaceSearchResult) => void;
  onProductUpdate?: (product: MarketplaceProduct) => void;
}

export function useMarketplace(options: UseMarketplaceOptions = {}) {
  const socket = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MarketplaceErrorResponse | null>(null);
  const [searchResult, setSearchResult] = useState<MarketplaceSearchResult | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleSearchResult: SocketEventHandler<MarketplaceResponse<MarketplaceSearchResult>> = 
      (response) => {
        if (response.success) {
          setSearchResult(response.data);
          options.onSearchResult?.(response.data);
        }
        setIsLoading(false);
      };

    const handleProductUpdate: SocketEventHandler<MarketplaceResponse<MarketplaceProduct>> = 
      (response) => {
        if (response.success && options.onProductUpdate) {
          options.onProductUpdate(response.data);
        }
      };

    const handleError: SocketEventHandler<MarketplaceErrorResponse> = (error) => {
      setError(error);
      options.onError?.(error);
      setIsLoading(false);
    };

    // Register event listeners
    socket.on(MarketplaceEvent.SEARCH_RESULT, handleSearchResult);
    socket.on(MarketplaceEvent.PRODUCT_CREATE, handleProductUpdate);
    socket.on(MarketplaceEvent.PRODUCT_UPDATE, handleProductUpdate);
    socket.on(MarketplaceEvent.ERROR, handleError);

    return () => {
      // Cleanup listeners
      socket.off(MarketplaceEvent.SEARCH_RESULT, handleSearchResult);
      socket.off(MarketplaceEvent.PRODUCT_CREATE, handleProductUpdate);
      socket.off(MarketplaceEvent.PRODUCT_UPDATE, handleProductUpdate);
      socket.off(MarketplaceEvent.ERROR, handleError);
    };
  }, [socket, options]);

  const search = useCallback((filters: MarketplaceFilterOptions) => {
    if (!socket) return;
    setIsLoading(true);
    setError(null);
    socket.emit(MarketplaceEvent.SEARCH, filters);
  }, [socket]);

  const createProduct = useCallback((data: CreateProductData) => {
    if (!socket) return;
    setIsLoading(true);
    setError(null);
    socket.emit(MarketplaceEvent.PRODUCT_CREATE, data);
  }, [socket]);

  const updateProduct = useCallback((id: string, data: UpdateProductData) => {
    if (!socket) return;
    setIsLoading(true);
    setError(null);
    socket.emit(MarketplaceEvent.PRODUCT_UPDATE, { id, data });
  }, [socket]);

  return {
    // State
    isLoading,
    error,
    searchResult,

    // Actions
    search,
    createProduct,
    updateProduct,

    // Reset functions
    clearError: useCallback(() => setError(null), []),
    clearSearchResult: useCallback(() => setSearchResult(null), []),
  } as const;
}

// Export types for components
export type UseMarketplaceReturn = ReturnType<typeof useMarketplace>;