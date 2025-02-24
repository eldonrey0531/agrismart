/**
 * Security event types
 */
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'password_expiry'
  | 'password_expired'
  | 'password_check'
  | 'two_factor_setup'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'two_factor_verified'
  | 'two_factor_failed'
  | 'two_factor_recovery'
  | 'account_locked'
  | 'account_unlocked'
  | 'failed_login'
  | 'suspicious_activity'
  | 'new_device'
  | 'new_location'
  | 'session_expired'
  | 'multiple_failures';

/**
 * Security event severity
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Security event status
 */
export type SecurityEventStatus = 
  | 'success'
  | 'failed'
  | 'blocked'
  | 'pending'
  | 'verified'
  | 'error';

/**
 * Two-factor authentication methods
 */
export type TwoFactorMethod = 'app' | 'sms' | 'email';

/**
 * Two-factor setup data
 */
export interface TwoFactorSetupData {
  setupStarted: Date;
  setupCompleted?: Date;
  verified: boolean;
  verifiedAt?: Date;
  recoveryCodesRemaining?: number;
  lastRecoveryUse?: Date;
}

/**
 * Two-factor verification result
 */
export interface TwoFactorVerifyResult {
  isValid: boolean;
  isBackupCode?: boolean;
  attemptsRemaining?: number;
  blockedUntil?: Date;
}

/**
 * Password expiry result
 */
export interface PasswordExpiryResult {
  isExpiring: boolean;
  daysUntilExpiry: number;
  requiresChange: boolean;
  expiryDate: Date;
  lastChanged: Date;
}

/**
 * Password security status
 */
export interface PasswordSecurityStatus {
  expiry: PasswordExpiryResult;
  recommendations: string[];
  requiresChange: boolean;
  nextRequiredChange?: Date;
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Security preferences for user accounts
 */
export interface SecurityPreferences {
  // Authentication settings
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  twoFactorBackupEnabled: boolean;
  twoFactorVerified: boolean;
  twoFactorSetup?: TwoFactorSetupData;

  // Password management
  passwordExpiryDays: number;
  passwordMinAge: number;
  passwordHistory: number;
  lastPasswordReset: Date | null;
  passwordExpiresAt: Date | null;
  
  // Login security
  loginNotifications: boolean;
  allowedIPs?: string[];
  allowedDevices?: string[];
  lockoutThreshold: number;
  lockoutDuration: number; // in minutes
  
  // Session settings
  sessionTimeout: number; // in minutes
  maxConcurrentSessions: number;
  
  // Notification preferences
  notifyOnNewDevice: boolean;
  notifyOnNewLocation: boolean;
  notifyOnPasswordChange: boolean;
  notifyOnTwoFactorChange: boolean;
  notifyOnPasswordExpiry: boolean;
}

/**
 * Default security preferences
 */
export const DEFAULT_SECURITY_PREFERENCES: SecurityPreferences = {
  // Authentication settings
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  twoFactorBackupEnabled: true,
  twoFactorVerified: false,

  // Password management
  passwordExpiryDays: 90,
  passwordMinAge: 1,
  passwordHistory: 5,
  lastPasswordReset: null,
  passwordExpiresAt: null,

  // Login security
  loginNotifications: true,
  allowedIPs: [],
  allowedDevices: [],
  lockoutThreshold: 5,
  lockoutDuration: 30,

  // Session settings
  sessionTimeout: 60,
  maxConcurrentSessions: 5,

  // Notification preferences
  notifyOnNewDevice: true,
  notifyOnNewLocation: true,
  notifyOnPasswordChange: true,
  notifyOnTwoFactorChange: true,
  notifyOnPasswordExpiry: true,
};

/**
 * Login event data structure
 */
export interface LoginEvent {
  type: SecurityEventType;
  status: SecurityEventStatus;
  severity: SecurityEventSeverity;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
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
    location?: string;
  };
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  expiresAt: Date;
  isCurrentSession: boolean;
  requires2FA?: boolean;
  is2FAVerified?: boolean;
}

/**
 * Security event handler options
 */
export interface SecurityEventHandlerOptions {
  notify?: boolean;
  log?: boolean;
  updateUser?: boolean;
  severity?: SecurityEventSeverity;
  metadata?: Record<string, unknown>;
}

/**
 * Recovery code format
 */
export interface RecoveryCode {
  code: string;
  used: boolean;
  usedAt?: Date;
  metadata?: Record<string, unknown>;
}