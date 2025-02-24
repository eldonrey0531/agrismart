import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityClient } from '@/lib/security/client';
import type {
  SecurityStatus,
  SecurityEvent,
  SecurityPreferences,
  SessionInfo,
} from '@/types/security';

/**
 * Hook for security functionality
 */
export function useSecurity() {
  const queryClient = useQueryClient();

  // Get security status
  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
  } = useQuery<SecurityStatus>({
    queryKey: ['security-status'],
    queryFn: () => securityClient.getSecurityStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get security events
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useQuery<SecurityEvent[]>({
    queryKey: ['security-events'],
    queryFn: () => securityClient.getSecurityEvents(),
  });

  // Get active sessions
  const {
    data: sessions,
    isLoading: isSessionsLoading,
    error: sessionsError,
  } = useQuery<SessionInfo[]>({
    queryKey: ['security-sessions'],
    queryFn: () => securityClient.getSessions(),
  });

  // Update preferences mutation
  const { mutate: updatePreferences } = useMutation({
    mutationFn: (prefs: Partial<SecurityPreferences>) =>
      securityClient.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-status'] });
    },
  });

  // Enable 2FA mutation
  const { mutate: enable2FA } = useMutation({
    mutationFn: () => securityClient.enableTwoFactor(),
  });

  // Disable 2FA mutation
  const { mutate: disable2FA } = useMutation({
    mutationFn: (code: string) => securityClient.disableTwoFactor(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-status'] });
    },
  });

  // Verify 2FA mutation
  const { mutate: verify2FA } = useMutation({
    mutationFn: (code: string) => securityClient.verifyTwoFactor(code),
  });

  // Revoke session mutation
  const { mutate: revokeSession } = useMutation({
    mutationFn: (sessionId: string) => securityClient.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-sessions'] });
    },
  });

  // Revoke all sessions mutation
  const { mutate: revokeAllSessions } = useMutation({
    mutationFn: () => securityClient.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-sessions'] });
    },
  });

  // Get metrics
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: () => securityClient.getMetrics(),
  });

  // Check password status
  const {
    data: passwordStatus,
    isLoading: isPasswordStatusLoading,
    error: passwordStatusError,
  } = useQuery({
    queryKey: ['password-status'],
    queryFn: () => securityClient.checkPasswordStatus(),
  });

  return {
    // Status and data
    status,
    events,
    sessions,
    metrics,
    passwordStatus,

    // Loading states
    isStatusLoading,
    isEventsLoading,
    isSessionsLoading,
    isMetricsLoading,
    isPasswordStatusLoading,

    // Errors
    statusError,
    eventsError,
    sessionsError,
    metricsError,
    passwordStatusError,

    // Actions
    updatePreferences,
    enable2FA,
    disable2FA,
    verify2FA,
    revokeSession,
    revokeAllSessions,
  };
}

// Export singleton instance for direct use
export const security = securityClient;