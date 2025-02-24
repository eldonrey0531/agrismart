import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Security event types
 */
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'password_check'
  | 'password_expired'
  | 'password_expiry'
  | 'account_locked'
  | 'account_unlocked'
  | 'failed_login'
  | 'suspicious_activity';

/**
 * Security event severity
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Security event status
 */
export type SecurityEventStatus = 'success' | 'failed' | 'blocked' | 'pending' | 'error';

/**
 * Security preferences structure
 */
export interface SecurityPreferences {
  passwordExpiryDays: number;
  passwordMinAge: number;
  passwordHistory: number;
  lastPasswordReset: Date | null;
  passwordExpiresAt: Date | null;
  loginNotifications: boolean;
  twoFactorEnabled: boolean;
  lockoutThreshold: number;
  lockoutDuration: number;
}

/**
 * Login history entry
 */
export interface LoginHistoryEntry {
  timestamp: Date;
  ipAddress: string;
  device: string;
  browser: string;
  location?: string;
  status: 'success' | 'failed';
  reason?: string;
}

/**
 * Password history entry
 */
export interface PasswordHistoryEntry {
  hash: string;
  timestamp: Date;
  metadata?: {
    ipAddress?: string;
    device?: string;
    [key: string]: unknown;
  };
}

/**
 * Device info
 */
export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  browser?: string;
  os?: string;
  lastSeen: Date;
  trusted: boolean;
}

/**
 * Session info
 */
export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  expiresAt: Date;
  isRevoked: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Security event data
 */
export interface SecurityEventData {
  userId: string;
  type: SecurityEventType;
  status: SecurityEventStatus;
  severity: SecurityEventSeverity;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extended user type with security data
 */
export type UserWithSecurity = {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  securityPreferences: SecurityPreferences | null;
  failedLoginAttempts: number;
  lastFailedLogin: Date | null;
  lockedUntil: Date | null;
  loginHistory: LoginHistoryEntry[];
  passwordHistory: PasswordHistoryEntry[];
  lastDeviceInfo: DeviceInfo | null;
  lastActiveAt: Date | null;
  sessions: SessionInfo[];
};

/**
 * Security operations interface
 */
export interface SecurityOperations {
  findWithSecurity(userId: string): Promise<UserWithSecurity | null>;
  recordLoginEvent(event: SecurityEventData): Promise<void>;
  getSecurityEvents(userId: string, limit?: number): Promise<SecurityEventData[]>;
  updateSecurityPreferences(userId: string, preferences: Partial<SecurityPreferences>): Promise<void>;
  addPasswordHistory(userId: string, hash: string, metadata?: Record<string, unknown>): Promise<void>;
  addLoginHistory(userId: string, entry: LoginHistoryEntry): Promise<void>;
}

/**
 * Extended Prisma client with security operations
 */
export interface PrismaClientWithSecurity extends PrismaClient {
  security: SecurityOperations;
}

/**
 * Password security status
 */
export interface PasswordSecurityStatus {
  strength: 'weak' | 'medium' | 'strong';
  lastChanged?: Date;
  expiresAt?: Date;
  requiresChange: boolean;
  daysUntilExpiry?: number;
  recommendations: string[];
}