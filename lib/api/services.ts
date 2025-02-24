import { api } from '@/lib/api';
import type { UserWithSecurity } from '@/types/prisma';
import type { ModerationStatus } from '@/lib/community/access-control';

/**
 * Auth service types
 */
interface LoginCredentials {
  email: string;
  password: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface PasswordResetData {
  token: string;
  password: string;
}

/**
 * Security service types
 */
interface SecurityPreferences {
  passwordExpiryDays: number;
  loginNotifications: boolean;
  twoFactorEnabled: boolean;
}

/**
 * Auth service
 */
export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<{ token: string }>('/auth/login', credentials),

  logout: () =>
    api.post('/auth/logout'),

  changePassword: (data: PasswordChangeData) =>
    api.post('/auth/password', data),

  resetPassword: (data: PasswordResetData) =>
    api.post('/auth/password/reset', data),

  verifyEmail: (token: string) =>
    api.post(`/auth/verify-email/${token}`),

  resendVerification: (email: string) =>
    api.post('/auth/verify-email/resend', { email })
};

/**
 * Security service
 */
export const securityService = {
  getSecurityStatus: () =>
    api.get<UserWithSecurity>('/security/status'),

  updatePreferences: (preferences: Partial<SecurityPreferences>) =>
    api.patch('/security/preferences', preferences),

  getSecurityEvents: (limit?: number) =>
    api.get('/security/events', { params: { limit } }),

  enableTwoFactor: () =>
    api.post('/security/2fa/enable'),

  disableTwoFactor: (code: string) =>
    api.post('/security/2fa/disable', { code }),

  verifyTwoFactor: (code: string) =>
    api.post('/security/2fa/verify', { code })
};

/**
 * Moderation service
 */
export const moderationService = {
  getQueue: (status?: ModerationStatus, type?: string) =>
    api.get('/admin/moderation', { params: { status, type } }),

  getStats: () =>
    api.get('/admin/moderation/stats'),

  getLogs: (filters?: any) =>
    api.get('/admin/moderation/logs', { params: filters }),

  moderateContent: (ids: string[], action: { status: ModerationStatus; reason: string }) =>
    api.patch('/admin/moderation', { ids, action }),

  getReports: () =>
    api.get('/admin/reports'),

  resolveReport: (reportId: string, data: { action: string; note: string }) =>
    api.post(`/admin/reports/${reportId}/resolve`, data)
};

/**
 * User service
 */
export const userService = {
  getProfile: () =>
    api.get('/user/profile'),

  updateProfile: (data: any) =>
    api.patch('/user/profile', data),

  getSettings: () =>
    api.get('/user/settings'),

  updateSettings: (data: any) =>
    api.patch('/user/settings', data)
};

/**
 * Extend API client with services
 */
export const extendedApi = {
  ...api,
  auth: authService,
  security: securityService,
  moderation: moderationService,
  user: userService
};