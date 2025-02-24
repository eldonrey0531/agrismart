import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/api-response';
import { ApiException } from '@/lib/utils/error-handler';
import { ERROR_MESSAGES } from '@/lib/constants';
import { getClientIp, getUserAgent } from '@/lib/utils/request';

// Add Prisma type for LoginEvent
type LoginEvent = {
  id: string;
  userId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  reason?: string;
  location?: string;
  device?: string;
};

// Get login history for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get token from authorization header
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    const userId = decoded.user.id;

    // Get login history from database
    const events = await prisma.loginEvent.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Limit to last 50 events
    });

    return ApiResponse.success(
      { events },
      'Login history retrieved successfully'
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Record a new login event
export async function POST(req: NextRequest) {
  try {
    const { userId, status, reason } = await req.json();

    if (!userId || !status) {
      throw new ApiException('Missing required fields', 400);
    }

    // Create login event
    const event = await prisma.loginEvent.create({
      data: {
        userId,
        status,
        reason,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        timestamp: new Date(),
        // TODO: Add location using GeoIP service
        // location: await getLocationFromIp(ipAddress),
        // TODO: Add device detection
        // device: parseUserAgent(userAgent),
      }
    });

    return ApiResponse.success(
      { event },
      'Login event recorded successfully',
      201
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Clear login history (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Verify token and check admin role
    const decoded = verifyToken(token);
    if (decoded.user.role !== 'admin') {
      return ApiResponse.forbidden();
    }

    const { userId, before } = await req.json();

    if (!userId) {
      throw new ApiException('User ID is required', 400);
    }

    // Delete login events
    const result = await prisma.loginEvent.deleteMany({
      where: {
        userId,
        ...(before && {
          timestamp: {
            lt: new Date(before)
          }
        })
      }
    });

    return ApiResponse.success(
      { deletedCount: result.count },
      'Login history cleared successfully'
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ApiResponse.cors();
}