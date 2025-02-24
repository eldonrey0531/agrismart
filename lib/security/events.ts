import { prisma } from '@/lib/prisma';
import { getClientInfo } from '@/lib/utils/request';
import type { 
  SecurityEventType, 
  SecurityEventSeverity, 
  SecurityEventStatus,
  SecurityEventHandlerOptions,
  SecurityEventMetadata,
  SecureUser
} from '@/types/server';
import { sendSecurityNotification } from '@/lib/email/security-notifications';
import { NextRequest } from 'next/server';

interface CreateEventParams {
  userId: string;
  type: SecurityEventType;
  status: SecurityEventStatus;
  severity: SecurityEventSeverity;
  req: NextRequest;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create and record a security event
 */
export async function createSecurityEvent({
  userId,
  type,
  status,
  severity,
  req,
  reason,
  metadata = {}
}: CreateEventParams) {
  const clientInfo = await getClientInfo(req);

  const event = await prisma.loginEvent.create({
    data: {
      userId,
      type,
      status,
      severity,
      reason,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      location: clientInfo.location || undefined,
      device: clientInfo.device,
      metadata: {
        ...clientInfo,
        ...metadata
      },
      timestamp: new Date()
    }
  });

  // Log to security log for monitoring
  await prisma.securityLog.create({
    data: {
      type,
      ipAddress: clientInfo.ipAddress,
      endpoint: req.nextUrl.pathname,
      method: req.method,
      status: status === 'success' ? 200 : 400,
      metadata: {
        userId,
        severity,
        reason,
        ...metadata
      }
    }
  });

  return event;
}

/**
 * Handle a security event with notifications and logging
 */
export async function handleSecurityEvent(
  userId: string,
  type: SecurityEventType,
  req: NextRequest,
  options: SecurityEventHandlerOptions = {}
): Promise<void> {
  const {
    notify = true,
    log = true,
    updateUser = false,
    severity = 'low',
    metadata = {}
  } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  // Create security event
  if (log) {
    await createSecurityEvent({
      userId,
      type,
      status: 'success',
      severity,
      req,
      metadata
    });
  }

  // Send notification if enabled
  if (notify && user.securityPreferences?.loginNotifications) {
    const clientInfo = await getClientInfo(req);
    await sendSecurityNotification({
      user: user as SecureUser,
      type,
      severity,
      metadata: clientInfo
    });
  }

  // Update user if needed
  if (updateUser) {
    await updateUserSecurityStatus(userId, type);
  }
}

/**
 * Handle failed security events
 */
export async function handleFailedSecurityEvent(
  userId: string,
  type: SecurityEventType,
  req: NextRequest,
  reason: string,
  options: SecurityEventHandlerOptions = {}
): Promise<void> {
  const {
    notify = true,
    log = true,
    updateUser = true,
    severity = 'medium',
    metadata = {}
  } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  // Create failed security event
  if (log) {
    await createSecurityEvent({
      userId,
      type,
      status: 'failed',
      severity,
      req,
      reason,
      metadata
    });
  }

  // Send notification for failed event
  if (notify && user.securityPreferences?.loginNotifications) {
    const clientInfo = await getClientInfo(req);
    await sendSecurityNotification({
      user: user as SecureUser,
      type,
      severity,
      metadata: {
        ...clientInfo,
        reason
      }
    });
  }

  // Update user security status
  if (updateUser) {
    await updateUserSecurityStatus(userId, type, true);
  }
}

/**
 * Update user security status based on events
 */
async function updateUserSecurityStatus(
  userId: string, 
  eventType: SecurityEventType,
  isFailed: boolean = false
): Promise<void> {
  if (isFailed) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1
        },
        lastFailedLogin: new Date(),
        lockedUntil: {
          set: await shouldLockAccount(userId) ? 
            new Date(Date.now() + 30 * 60 * 1000) : // 30 minutes
            null
        }
      }
    });
  } else {
    // Reset security status on successful events
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
        ...(eventType === 'login' ? {
          lastLoginAt: new Date()
        } : {})
      }
    });
  }
}

/**
 * Check if account should be locked based on failed attempts
 */
async function shouldLockAccount(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      failedLoginAttempts: true,
      securityPreferences: true
    }
  });

  if (!user) return false;

  const lockoutThreshold = user.securityPreferences?.lockoutThreshold || 5;
  return (user.failedLoginAttempts + 1) >= lockoutThreshold;
}

/**
 * Check if a security action is allowed
 */
export async function checkSecurityStatus(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
    return {
      allowed: false,
      reason: `Account is locked. Try again in ${remainingTime} minutes.`
    };
  }

  return { allowed: true };
}