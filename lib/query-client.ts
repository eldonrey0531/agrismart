import { 
  QueryClient, 
  UseQueryResult,
  QueryKey,
  QueryFunction,
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  useQueryClient as useReactQueryClient,
  useInfiniteQuery as useReactInfiniteQuery,
  QueryOptions
} from '@tanstack/react-query';

/**
 * Query error type
 */
export interface QueryError {
  statusCode?: number;
  message: string;
  code?: string;
}

/**
 * Query result type with error handling
 */
export type QueryResult<TData> = UseQueryResult<TData, QueryError>;

/**
 * Query options with error typing
 */
export interface TypedQueryOptions<TData> extends Omit<QueryOptions<TData, QueryError, TData>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number | false;
  retry?: boolean | number | ((failureCount: number, error: QueryError) => boolean);
}

/**
 * Default query client options
 */
const defaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount: number, error: QueryError) => {
      // Don't retry on 401/403 errors
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
  },
};

/**
 * Create query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions,
});

/**
 * Type-safe useQuery hook
 */
export function useQuery<TData>(options: TypedQueryOptions<TData>): QueryResult<TData> {
  return useReactQuery<TData, QueryError>({
    ...options,
    gcTime: options.gcTime ?? defaultOptions.queries.gcTime,
    staleTime: options.staleTime ?? defaultOptions.queries.staleTime,
  });
}

/**
 * Type-safe useMutation hook
 */
export const useMutation = useReactMutation;

/**
 * Type-safe useQueryClient hook
 */
export const useQueryClient = useReactQueryClient;

/**
 * Type-safe useInfiniteQuery hook
 */
export const useInfiniteQuery = useReactInfiniteQuery;

/**
 * Re-export types
 */
export type { UseQueryResult, QueryKey, QueryFunction };

/**
 * Clear all query cache
 */
export function clearQueryCache(): void {
  queryClient.clear();
}

/**
 * Clear queries by key pattern
 */
export function clearQueriesByKey(keyPattern: string | RegExp): void {
  const queries = queryClient.getQueryCache().findAll();
  queries.forEach((query) => {
    const queryKey = Array.isArray(query.queryKey) 
      ? query.queryKey.join('/')
      : String(query.queryKey);
    
    if (typeof keyPattern === 'string' && queryKey.includes(keyPattern)) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    } else if (keyPattern instanceof RegExp && keyPattern.test(queryKey)) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
}

/**
 * Prefetch query data
 */
export async function prefetchQuery<TData>(
  key: QueryKey,
  fn: QueryFunction<TData>,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
}

/**
 * Set query data directly
 */
export function setQueryData<TData>(
  key: QueryKey,
  data: TData
): void {
  queryClient.setQueryData(key, data);
}

/**
 * Invalidate queries by key
 */
export function invalidateQueries(key: QueryKey): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: key
  });
}
