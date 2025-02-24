import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateDatabaseConfig } from "@/lib/config/database";
import { db } from "@/lib/db/client";
import { DatabaseError } from "@/types/database";

/**
 * Database middleware handler
 */
export async function withDatabase(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  let isConnected = false;

  try {
    // Validate database configuration
    validateDatabaseConfig();

    // Connect to database
    await db.connect();
    isConnected = true;

    // Check database health
    const health = await db.checkHealth();
    if (!health.isHealthy) {
      throw new Error("Database health check failed");
    }

    // Add database metrics to response headers
    const response = await handler(request);
    const headers = new Headers(response.headers);
    
    const metrics = db.getMetrics();
    headers.set("X-DB-Queries", metrics.queries.toString());
    headers.set("X-DB-Slow-Queries", metrics.slowQueries.toString());
    headers.set("X-DB-Errors", metrics.errors.toString());

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

  } catch (error) {
    console.error("Database middleware error:", error);

    // Format error for response
    const dbError = error as DatabaseError;
    const errorResponse = {
      error: "Database error",
      code: dbError.code || "UNKNOWN_ERROR",
      message: process.env.NODE_ENV === "development" 
        ? dbError.message 
        : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });

  } finally {
    // Disconnect only if we connected successfully
    if (isConnected) {
      try {
        await db.disconnect();
      } catch (error) {
        console.error("Error disconnecting from database:", error);
      }
    }
  }
}

/**
 * Higher-order function to wrap route handlers with database middleware
 */
export function withDatabaseHandler(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    return withDatabase(request, handler);
  };
}

/**
 * Database health check endpoint handler
 */
export async function handleDatabaseHealth(
  request: NextRequest
): Promise<Response> {
  try {
    // Connect and check health
    await db.connect();
    const health = await db.checkHealth();
    
    if (!health.isHealthy) {
      return NextResponse.json(
        { status: "error", ...health },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: "ok", ...health },
      { status: 200 }
    );

  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: "Database health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );

  } finally {
    try {
      await db.disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

// Export for usage in API routes
export default withDatabaseHandler;