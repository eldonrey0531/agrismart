import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { httpResponse } from '@/lib/api-response';
import { AUTH, ERROR_MESSAGES } from '@/lib/constants';
import { verifyToken } from '@/lib/jwt';
import type { JwtUser } from '@/lib/jwt';

interface HandlerContext {
  user: JwtUser;
  token: string;
}

type ApiHandler = (
  req: NextRequest,
  ctx: HandlerContext
) => Promise<Response> | Response;

/**
 * Higher-order function to protect API routes with authentication
 */
export function withAuth(handler: ApiHandler) {
  return async function protectedHandler(req: NextRequest): Promise<Response> {
    try {
      // Get token from cookies
      const token = cookies().get(AUTH.TOKEN_NAME)?.value;

      if (!token) {
        return httpResponse.unauthorized(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED);
      }

      try {
        // Verify token and get user data
        const decoded = verifyToken(token);

        // Call the original handler with authenticated user context
        return await handler(req, {
          user: decoded.user,
          token,
        });
      } catch (error) {
        // Clear invalid token
        cookies().delete(AUTH.TOKEN_NAME);
        return httpResponse.unauthorized(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
      }
    } catch (error) {
      console.error('Protected route error:', error);
      return httpResponse.internalError(ERROR_MESSAGES.SERVER);
    }
  };
}

/**
 * Higher-order function to add rate limiting to API routes
 */
export function withRateLimit(
  handler: ApiHandler,
  options: { limit: number; window: number } = { limit: 100, window: 60000 }
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async function rateLimitedHandler(
    req: NextRequest,
    ctx: HandlerContext
  ): Promise<Response> {
    const identifier = ctx.user.id; // Use user ID for rate limiting
    const now = Date.now();

    // Get or create rate limit data for this user
    let rateData = requests.get(identifier);
    if (!rateData || now > rateData.resetTime) {
      rateData = {
        count: 0,
        resetTime: now + options.window,
      };
    }

    // Check rate limit
    if (rateData.count >= options.limit) {
      return httpResponse.tooManyRequests(ERROR_MESSAGES.API.RATE_LIMIT);
    }

    // Increment request count
    rateData.count += 1;
    requests.set(identifier, rateData);

    // Call the original handler
    return handler(req, ctx);
  };
}

interface ValidateOptions<T> {
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      error?: any;
      data: T;
    };
  };
}

/**
 * Helper to extract query parameters
 */
export function getQueryParams(req: NextRequest): Record<string, string> {
  const url = new URL(req.url);
  return Object.fromEntries(url.searchParams.entries());
}

/**
 * Helper to get pagination parameters
 */
export function getPaginationParams(req: NextRequest) {
  const { page = '1', limit = '10' } = getQueryParams(req);
  return {
    page: Math.max(1, parseInt(page)),
    limit: Math.min(100, Math.max(1, parseInt(limit))),
  };
}

/**
 * Helper to validate request body
 */
export async function validateBody<T>(
  req: NextRequest,
  options: ValidateOptions<T>
): Promise<T> {
  try {
    const body = await req.json();
    const result = options.schema.safeParse(body);

    if (!result.success) {
      throw new Error(
        Array.isArray(result.error)
          ? result.error.join(', ')
          : 'Invalid request body'
      );
    }

    return result.data;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Valid request body'));
  }
}

/**
 * Example usage:
 * 
 * export const GET = withAuth(
 *   withRateLimit(async (req, { user }) => {
 *     try {
 *       // Validate query parameters
 *       const { page, limit } = getPaginationParams(req);
 *       
 *       // Your protected API logic here
 *       return httpResponse.ok({
 *         data: 'Protected data',
 *         page,
 *         limit,
 *       });
 *     } catch (error) {
 *       return httpResponse.badRequest(error.message);
 *     }
 *   })
 * );
 */