import { api } from '@/lib/api';
import type {
  SecurityClient,
  SecurityStatus,
  SecurityEvent,
  SecurityPreferences,
  UserWithSecurity,
  SessionInfo,
} from '@/types/security';

/**
 * Security service implementation
 */
class SecurityService implements SecurityClient {
  /**
   * Get user's security status
   */
  async getSecurityStatus(): Promise<SecurityStatus> {
    const response = await api.get<SecurityStatus>('/api/security/status');
    return response;
  }

  /**
   * Get security events
   */
  async getSecurityEvents(limit?: number): Promise<SecurityEvent[]> {
    const response = await api.get<SecurityEvent[]>('/api/security/events', {
      params: { limit }
    });
    return response;
  }

  /**
   * Record security event
   */
  async recordEvent(event: SecurityEvent): Promise<void> {
    await api.post('/api/security/events', event);
  }

  /**
   * Update security preferences
   */
  async updatePreferences(prefs: Partial<SecurityPreferences>): Promise<void> {
    await api.patch('/api/security/preferences', prefs);
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/api/security/password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ secret: string; qrCode: string }> {
    const response = await api.post<{ secret: string; qrCode: string }>(
      '/api/security/2fa/enable'
    );
    return response;
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<void> {
    await api.post('/api/security/2fa/disable', { code });
  }

  /**
   * Verify two-factor code
   */
  async verifyTwoFactor(code: string): Promise<void> {
    await api.post('/api/security/2fa/verify', { code });
  }

  /**
   * Get active sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    const response = await api.get<SessionInfo[]>('/api/security/sessions');
    return response;
  }

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/api/security/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<void> {
    await api.delete('/api/security/sessions');
  }

  /**
   * Get security events for audit
   */
  async getAuditLog(
    page: number = 1,
    limit: number = 20
  ): Promise<{ events: SecurityEvent[]; total: number }> {
    const response = await api.get<{ events: SecurityEvent[]; total: number }>(
      '/api/security/audit',
      { params: { page, limit } }
    );
    return response;
  }

  /**
   * Check password status
   */
  async checkPasswordStatus(): Promise<{
    strength: 'weak' | 'medium' | 'strong';
    expiresAt?: Date;
    lastChanged?: Date;
    requiresChange: boolean;
  }> {
    const response = await api.get<{
      strength: 'weak' | 'medium' | 'strong';
      expiresAt?: Date;
      lastChanged?: Date;
      requiresChange: boolean;
    }>('/api/security/password/status');
    return response;
  }

  /**
   * Get security metrics
   */
  async getMetrics(): Promise<{
    failedLogins: number;
    suspiciousActivities: number;
    activeDevices: number;
    lastPasswordChange?: Date;
  }> {
    const response = await api.get<{
      failedLogins: number;
      suspiciousActivities: number;
      activeDevices: number;
      lastPasswordChange?: Date;
    }>('/api/security/metrics');
    return response;
  }
}

// Create and export security client instance
export const securityClient = new SecurityService();

// Export types
export type {
  SecurityStatus,
  SecurityEvent,
  SecurityPreferences,
  UserWithSecurity,
  SessionInfo,
};