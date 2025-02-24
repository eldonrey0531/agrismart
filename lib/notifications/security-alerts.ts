import { sendSecurityNotification } from '@/lib/email/security-notifications';
import { securityClient } from '@/lib/security/client';
import type { UserWithSecurity, SecurityEventData } from '@/types/prisma';
import type { 
  SecurityPreferences,
  PasswordExpiryResult,
  PasswordSecurityStatus,
  SecurityEventType,
  SecurityEventStatus,
  SecurityEventSeverity
} from '@/types/server';

const DEFAULT_CLIENT_INFO = {
  ipAddress: 'system',
  userAgent: 'system',
  device: 'system',
} as const;

/**
 * Create a security event with system info
 */
function createSystemEvent(
  userId: string,
  type: SecurityEventType,
  status: SecurityEventStatus,
  severity: SecurityEventSeverity,
  metadata?: Record<string, unknown>
): SecurityEventData {
  return {
    ...DEFAULT_CLIENT_INFO,
    userId,
    type,
    status,
    severity,
    metadata
  };
}

/**
 * Check password expiry status
 */
export async function checkPasswordExpiry(user: UserWithSecurity): Promise<PasswordExpiryResult> {
  const prefs = user.securityPreferences || {} as SecurityPreferences;
  const expiryDays = prefs.passwordExpiryDays || 90;
  const warnDays = 14; // Warn 14 days before expiry

  const lastChanged = prefs.lastPasswordReset || user.createdAt;
  const expiryDate = new Date(lastChanged.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  return {
    isExpiring: daysUntilExpiry <= warnDays,
    daysUntilExpiry,
    requiresChange: daysUntilExpiry <= 0,
    expiryDate,
    lastChanged
  };
}

/**
 * Send password expiry notification
 */
export async function sendExpiryNotification(
  user: UserWithSecurity,
  result: PasswordExpiryResult
): Promise<void> {
  if (!user.securityPreferences?.loginNotifications) return;

  await sendSecurityNotification({
    user,
    type: 'password_expiry',
    severity: result.requiresChange ? 'high' : 'medium',
    metadata: {
      daysUntilExpiry: result.daysUntilExpiry,
      requiresChange: result.requiresChange,
      expiryDate: result.expiryDate.toISOString(),
      lastChanged: result.lastChanged.toISOString()
    }
  });
}

/**
 * Check password age and notify if necessary
 */
export async function checkPasswordAge(userId: string): Promise<void> {
  const user = await securityClient.security.findWithSecurity(userId);
  if (!user) return;

  const result = await checkPasswordExpiry(user);
  
  // Send notification if password is expiring soon or expired
  if (result.isExpiring) {
    await sendExpiryNotification(user, result);

    // Record event if password has expired
    if (result.requiresChange) {
      const event = createSystemEvent(
        userId,
        'password_expired',
        'blocked',
        'high',
        {
          daysExpired: Math.abs(result.daysUntilExpiry),
          expiryDate: result.expiryDate.toISOString(),
          lastChanged: result.lastChanged.toISOString()
        }
      );

      await securityClient.security.recordLoginEvent(event);
    }
  }
}

/**
 * Get password status message
 */
export function getPasswordStatusMessage(result: PasswordExpiryResult): string {
  if (result.requiresChange) {
    return 'Your password has expired. Please change it to continue.';
  }
  
  if (result.isExpiring) {
    return `Your password will expire in ${result.daysUntilExpiry} days. Please change it soon.`;
  }

  return `Your password will expire in ${result.daysUntilExpiry} days.`;
}

/**
 * Check password security status
 */
export async function checkPasswordSecurity(user: UserWithSecurity): Promise<PasswordSecurityStatus> {
  const expiry = await checkPasswordExpiry(user);
  const recommendations: string[] = [];

  // Check password age
  const daysSinceChange = Math.floor(
    (Date.now() - (user.securityPreferences?.lastPasswordReset || user.createdAt).getTime()) / 
    (24 * 60 * 60 * 1000)
  );

  // Add recommendations based on security status
  if (daysSinceChange > 180) {
    recommendations.push(
      'Your password is over 6 months old. Consider changing it for better security.'
    );
  }

  if (!user.securityPreferences?.twoFactorEnabled) {
    recommendations.push(
      'Enable two-factor authentication for additional security.'
    );
  }

  if (user.passwordHistory.length < 2) {
    recommendations.push(
      'Regular password changes help keep your account secure.'
    );
  }

  // Determine password strength based on history and settings
  let strength: PasswordSecurityStatus['strength'] = 'medium';
  
  if (
    !user.securityPreferences?.twoFactorEnabled ||
    daysSinceChange > 180 ||
    user.passwordHistory.length < 2
  ) {
    strength = 'weak';
  } else if (
    user.securityPreferences.twoFactorEnabled &&
    daysSinceChange < 90 &&
    user.passwordHistory.length >= 3
  ) {
    strength = 'strong';
  }

  return {
    expiry,
    recommendations,
    requiresChange: expiry.requiresChange,
    nextRequiredChange: expiry.expiryDate,
    strength
  };
}