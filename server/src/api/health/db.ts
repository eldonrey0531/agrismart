import { handleDatabaseHealth } from "@/lib/middleware/database";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Database health check endpoint
 * GET /api/health/db
 */
export async function GET(request: NextRequest) {
  try {
    // Get detailed health metrics
    const health = await db.checkHealth();
    const metrics = db.getMetrics();
    const logs = db.getLogs("error").slice(-5); // Last 5 errors

    // Create response with detailed health information
    return NextResponse.json({
      status: health.isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connections: health.connections,
        latency: `${health.latency}ms`,
        metrics: {
          totalQueries: metrics.queries,
          slowQueries: metrics.slowQueries,
          errors: metrics.errors,
        },
        recentErrors: logs.map(log => ({
          timestamp: log.timestamp,
          message: log.message,
        })),
      },
      uptime: process.uptime(),
    }, {
      status: health.isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
        'X-DB-Latency': health.latency.toString(),
        'X-DB-Connections': health.connections.toString(),
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Database health check failed",
      details: process.env.NODE_ENV === "development" 
        ? error instanceof Error ? error.message : String(error)
        : undefined
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

/**
 * Head request for lightweight health check
 */
export async function HEAD(request: NextRequest) {
  try {
    await db.connect();
    const health = await db.checkHealth();
    await db.disconnect();

    return new Response(null, {
      status: health.isHealthy ? 200 : 503,
      headers: {
        'X-DB-Status': health.isHealthy ? 'healthy' : 'unhealthy',
        'X-DB-Latency': health.latency.toString(),
      }
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}

/**
 * Health check options
 */
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'no-store'
    }
  });
}