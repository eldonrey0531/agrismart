import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/errors';
import type { UserRole } from '@/types/auth';

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'role_change' | 'security_update' | 'permission_change';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface SecurityEventFilters {
  type?: SecurityEvent['type'][];
  status?: SecurityEvent['status'][];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface FetchEventsResponse {
  events: SecurityEvent[];
  total: number;
}

interface CreateEventResponse {
  event: SecurityEvent;
}

/**
 * Fetch security events
 */
async function fetchSecurityEvents(
  filters: SecurityEventFilters = {}
): Promise<FetchEventsResponse> {
  const params = new URLSearchParams();
  
  if (filters.type?.length) {
    params.set('type', filters.type.join(','));
  }
  if (filters.status?.length) {
    params.set('status', filters.status.join(','));
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate.toISOString());
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate.toISOString());
  }
  if (filters.limit) {
    params.set('limit', filters.limit.toString());
  }

  const response = await fetch(`/api/security/events?${params}`);
  if (!response.ok) {
    throw new ApiError('Failed to fetch security events', response.status);
  }

  const data = await response.json();
  return {
    events: data.events.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp),
    })),
    total: data.total,
  };
}

/**
 * Create a security event
 */
async function createSecurityEvent(
  event: Omit<SecurityEvent, 'id'>
): Promise<CreateEventResponse> {
  const response = await fetch('/api/security/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new ApiError('Failed to create security event', response.status);
  }

  const data = await response.json();
  return {
    event: {
      ...data.event,
      timestamp: new Date(data.event.timestamp),
    },
  };
}

/**
 * Hook for managing security events
 */
export function useSecurityEvents(filters: SecurityEventFilters = {}) {
  const queryClient = useQueryClient();
  const { role } = useAuth();

  // Query for fetching events
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['security-events', filters, role],
    queryFn: () => fetchSecurityEvents(filters),
    enabled: !!role,
  });

  // Mutation for creating events
  const {
    mutate: addEvent,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createSecurityEvent,
    onSuccess: (response) => {
      queryClient.setQueryData<FetchEventsResponse>(
        ['security-events', filters, role],
        (oldData) => {
          if (!oldData) return { events: [response.event], total: 1 };
          return {
            events: [response.event, ...oldData.events],
            total: oldData.total + 1,
          };
        }
      );
    },
  });

  // Filter events based on role
  const filteredEvents = (data?.events || []).filter((event) => {
    // Admin can see all events
    if (role === 'admin') return true;
    
    // Non-admins can't see role change events
    if (event.type === 'role_change') return false;
    
    // Users can only see their own events
    return true;
  });

  return {
    events: filteredEvents,
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    addEvent,
    isCreating,
  };
}

export type { SecurityEvent, SecurityEventFilters };
export default useSecurityEvents;