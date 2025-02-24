import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimiter } from "@/lib/utils/rate-limit";
import { prisma } from "@/lib/db";
import { Errors, ErrorMessages } from "@/lib/utils/error";

interface SyncLog {
  userId: string;
  action: "sync" | "status";
  itemCount?: number;
  success: boolean;
  error?: string;
  duration: number;
  timestamp: Date;
}

export async function withSyncMiddleware(
  req: NextRequest,
  handler: () => Promise<Response>
) {
  const startTime = Date.now();
  let syncLog: Partial<SyncLog> = {
    action: req.method === "GET" ? "status" : "sync",
    timestamp: new Date(),
  };

  try {
    // Check if it's a sync endpoint
    if (!req.url.includes("/api/sync")) {
      return handler();
    }

    // Get user ID from session
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw Errors.unauthorized(ErrorMessages.UNAUTHORIZED);
    }

    const userId = authHeader.split(" ")[1]; // In real app, verify token
    syncLog.userId = userId;

    // Apply rate limiting
    const limiter = await rateLimit(req.ip || "anonymous", RateLimiter.SYNC);
    
    if (!limiter.success) {
      throw Errors.badRequest(ErrorMessages.BAD_REQUEST);
    }

    // For POST requests, count items
    if (req.method === "POST") {
      const body = await req.clone().json();
      syncLog.itemCount = body.items?.length || 0;
    }

    // Execute handler
    const response = await handler();
    const success = response.ok;
    
    // Update sync log
    syncLog = {
      ...syncLog,
      success,
      duration: Date.now() - startTime,
      error: !success ? (await response.clone().json()).error : undefined,
    };

    // Store sync log
    await prisma.syncLog.create({
      data: syncLog as SyncLog,
    });

    // Update user's last sync timestamp
    if (success && req.method === "POST") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastSyncAt: new Date(),
        },
      });
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", limiter.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limiter.remaining.toString());
    response.headers.set("X-RateLimit-Reset", limiter.reset.toString());

    return response;

  } catch (error) {
    // Log error and duration
    syncLog = {
      ...syncLog,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    // Store error log
    if (syncLog.userId) {
      await prisma.syncLog.create({
        data: syncLog as SyncLog,
      });
    }

    // Return error response with proper message
    const appError = Errors.syncFailed(ErrorMessages.SYNC_FAILED, error);

    return NextResponse.json(
      {
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      { 
        status: appError.status,
        headers: {
          "X-Error-Code": appError.code,
          "X-Error-Time": new Date().toISOString(),
        }
      }
    );
  }
}

// Get sync stats for a user
export async function getSyncStats(userId: string) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalSyncs,
    recentSyncs,
    failedSyncs,
    averageDuration,
    lastSync,
  ] = await Promise.all([
    // Total syncs
    prisma.syncLog.count({
      where: { userId, action: "sync" },
    }),
    // Recent syncs (24h)
    prisma.syncLog.count({
      where: {
        userId,
        action: "sync",
        timestamp: { gte: dayAgo },
      },
    }),
    // Failed syncs
    prisma.syncLog.count({
      where: {
        userId,
        action: "sync",
        success: false,
      },
    }),
    // Average duration
    prisma.syncLog.aggregate({
      where: { userId, action: "sync", success: true },
      _avg: { duration: true },
    }),
    // Last successful sync
    prisma.syncLog.findFirst({
      where: { userId, action: "sync", success: true },
      orderBy: { timestamp: "desc" },
    }),
  ]);

  return {
    totalSyncs,
    recentSyncs,
    failedSyncs,
    averageDuration: averageDuration._avg.duration || 0,
    lastSync: lastSync?.timestamp,
    healthScore: Math.max(
      0,
      100 - (failedSyncs / Math.max(totalSyncs, 1)) * 100
    ),
  };
}