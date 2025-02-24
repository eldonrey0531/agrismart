import { NextRequest } from "next/server";
import { defaultRateLimiter, withRateLimit } from "@/lib/utils/rate-limit";

/**
 * GET /api/rate-limit
 * Check current rate limit status
 */
export async function GET(req: NextRequest) {
  try {
    const info = await withRateLimit(req, {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per window
    });

    return Response.json(info, {
      headers: {
        "X-RateLimit-Limit": info.total.toString(),
        "X-RateLimit-Remaining": info.remaining.toString(),
        "X-RateLimit-Reset": info.reset.toString(),
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to check rate limit" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-limit
 * Increment rate limit counter
 */
export async function POST(req: NextRequest) {
  try {
    const info = await defaultRateLimiter.increment(req);

    if (info.remaining <= 0) {
      return Response.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": info.total.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": info.reset.toString(),
            "Retry-After": Math.ceil((info.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return Response.json(info, {
      headers: {
        "X-RateLimit-Limit": info.total.toString(),
        "X-RateLimit-Remaining": info.remaining.toString(),
        "X-RateLimit-Reset": info.reset.toString(),
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to update rate limit" },
      { status: 500 }
    );
  }
}

// Route segment config
export const runtime = "edge";
export const dynamic = "force-dynamic";