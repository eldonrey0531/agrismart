import { useQuery, useQueryClient, type QueryError, type QueryResult } from '@/lib/query-client';
import { api } from '@/lib/api';
import type { PasswordSecurityStatus } from '@/types/server';

export interface PasswordStatusResponse {
  status: PasswordSecurityStatus;
  message: string;
  requiresAction: boolean;
  nextCheck?: Date;
  recommendations: string[];
}

const SECURITY_QUERY_KEY = ['password-security'] as const;

/**
 * Fixed intervals in milliseconds
 */
const INTERVALS = {
  FREQUENT: 5 * 60 * 1000,    // 5 minutes
  NORMAL: 30 * 60 * 1000,     // 30 minutes
  RELAXED: 60 * 60 * 1000,    // 1 hour
  LONG: 24 * 60 * 60 * 1000,  // 24 hours
} as const;

/**
 * Get refetch interval based on security status
 */
function getRefetchInterval(data: PasswordStatusResponse | undefined): number {
  if (!data) return INTERVALS.FREQUENT;

  if (data.requiresAction) return INTERVALS.FREQUENT;
  
  switch (data.status.strength) {
    case 'weak':
      return INTERVALS.NORMAL;
    case 'medium':
      return INTERVALS.RELAXED;
    case 'strong':
      return INTERVALS.LONG;
    default:
      return INTERVALS.NORMAL;
  }
}

/**
 * Hook for managing password security status
 */
export function usePasswordSecurity(options: {
  enabled?: boolean;
  refetchInterval?: number | false;
} = {}): QueryResult<PasswordStatusResponse> {
  const {
    enabled = true,
    refetchInterval = false
  } = options;

  // Calculate initial refetch interval
  const initialInterval = refetchInterval === false 
    ? false 
    : (typeof refetchInterval === 'number' ? refetchInterval : INTERVALS.FREQUENT);

  return useQuery<PasswordStatusResponse>({
    queryKey: SECURITY_QUERY_KEY,
    queryFn: async () => {
      const data = await api.security.getPasswordStatus();
      
      // Convert date strings to Date objects
      if (data.nextCheck) {
        data.nextCheck = new Date(data.nextCheck);
      }
      if (data.status.nextRequiredChange) {
        data.status.nextRequiredChange = new Date(data.status.nextRequiredChange);
      }
      if (data.status.expiry) {
        data.status.expiry.expiryDate = new Date(data.status.expiry.expiryDate);
        data.status.expiry.lastChanged = new Date(data.status.expiry.lastChanged);
      }

      return data;
    },
    enabled,
    refetchInterval: initialInterval,
    retry: (failureCount: number, error: QueryError) => {
      // Don't retry on 401/403 errors
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
}

/**
 * Hook for managing password security recommendations
 */
export function usePasswordRecommendations(): {
  recommendations: string[];
  requiresAction: boolean;
  strength: PasswordSecurityStatus['strength'];
  message: string;
  isLoading: boolean;
} {
  const { data, isLoading } = usePasswordSecurity({
    refetchInterval: false // Don't auto-refresh recommendations
  });

  return {
    recommendations: data?.recommendations || [],
    requiresAction: data?.requiresAction || false,
    strength: data?.status.strength || 'medium',
    message: data?.message || '',
    isLoading
  };
}

/**
 * Hook for checking if password requires immediate action
 */
export function usePasswordActionRequired(): {
  requiresAction: boolean;
  message?: string;
  isLoading: boolean;
  nextRequiredChange?: Date;
  daysUntilExpiry?: number;
} {
  const { data, isLoading } = usePasswordSecurity({
    refetchInterval: INTERVALS.FREQUENT // Check every 5 minutes if action is required
  });

  return {
    requiresAction: data?.requiresAction || false,
    message: data?.message,
    isLoading,
    nextRequiredChange: data?.status.nextRequiredChange,
    daysUntilExpiry: data?.status.expiry?.daysUntilExpiry
  };
}

/**
 * Hook for password strength monitoring
 */
export function usePasswordStrength(): {
  strength: PasswordSecurityStatus['strength'];
  recommendations: string[];
  lastChanged?: Date;
  nextCheck?: Date;
  isLoading: boolean;
} {
  // Create query with dynamic interval
  const result = usePasswordSecurity({
    refetchInterval: INTERVALS.NORMAL // Start with normal interval
  });

  // Update interval based on current data
  const interval = getRefetchInterval(result.data);

  // Re-create query with updated interval if needed
  const { data, isLoading } = usePasswordSecurity({
    refetchInterval: interval
  });

  return {
    strength: data?.status.strength || 'medium',
    recommendations: data?.recommendations || [],
    lastChanged: data?.status.expiry?.lastChanged,
    nextCheck: data?.nextCheck,
    isLoading
  };
}