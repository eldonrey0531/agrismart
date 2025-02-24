import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import { getClientInfo } from '@/lib/utils/request';
import type { User, Session } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ACTIVE_SESSIONS = 5;

interface SessionWithUser extends Session {
  user: Pick<User, 'id' | 'email' | 'name' | 'role' | 'isVerified'>;
}

/**
 * Create a new session for a user
 */
export async function createSession(user: User, req: NextRequest): Promise<Session> {
  const clientInfo = await getClientInfo(req);
  const token = uuidv4();

  // Clean up expired sessions first
  await cleanupExpiredSessions(user.id);

  // Count active sessions
  const activeSessions = await prisma.session.count({
    where: {
      userId: user.id,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    }
  });

  // If at max sessions, revoke oldest
  if (activeSessions >= MAX_ACTIVE_SESSIONS) {
    const oldestSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActive: 'asc' }
    });

    if (oldestSession) {
      await revokeSession(oldestSession.id);
    }
  }

  // Create new session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      device: clientInfo.device,
      browser: clientInfo.browser || 'Unknown',
      ipAddress: clientInfo.ipAddress,
      location: clientInfo.location || undefined,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY),
      metadata: {
        os: clientInfo.os,
        userAgent: clientInfo.userAgent
      }
    }
  });

  // Update user's last activity
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActiveAt: new Date(),
      lastDeviceInfo: clientInfo
    }
  });

  return session;
}

/**
 * Validate and refresh a session
 */
export async function validateSession(token: string, req: NextRequest): Promise<SessionWithUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true
        }
      }
    }
  });

  if (!session || session.isRevoked || session.expiresAt <= new Date()) {
    return null;
  }

  // Optional: Verify client info matches (for security)
  const clientInfo = await getClientInfo(req);
  if (session.ipAddress !== clientInfo.ipAddress) {
    // Log potential security concern but don't invalidate
    // Could be legitimate IP change (mobile, VPN)
    console.warn('Session IP mismatch:', {
      sessionId: session.id,
      expectedIp: session.ipAddress,
      actualIp: clientInfo.ipAddress
    });
  }

  // Update last active timestamp
  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: { lastActive: new Date() },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true
        }
      }
    }
  });

  return updatedSession;
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date()
    }
  });
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
  await prisma.session.updateMany({
    where: {
      userId,
      id: { not: exceptSessionId },
      isRevoked: false
    },
    data: {
      isRevoked: true,
      revokedAt: new Date()
    }
  });
}

/**
 * Get all active sessions for a user
 */
export async function getActiveSessions(userId: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { lastActive: 'desc' }
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(userId?: string): Promise<void> {
  const where = {
    isRevoked: false,
    expiresAt: { lt: new Date() },
    ...(userId ? { userId } : {})
  };

  await prisma.session.updateMany({
    where,
    data: {
      isRevoked: true,
      revokedAt: new Date()
    }
  });
}

/**
 * Get total active sessions count
 */
export async function getActiveSessionsCount(userId: string): Promise<number> {
  return prisma.session.count({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    }
  });
}