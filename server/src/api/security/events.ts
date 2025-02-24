import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';
import { ApiResponse } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/types/auth';
import type { SecurityEvent, SecurityEventCreateInput } from '@/types/security';
import { SecurityEventType, SecurityEventStatus } from '@prisma/client';

// Event validation schema
const eventSchema = z.object({
  type: z.nativeEnum(SecurityEventType),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.nativeEnum(SecurityEventStatus),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Query params schema
const querySchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional(),
});

/**
 * Authorization check
 */
async function authorize(
  request: NextRequest,
  requiredRoles: UserRole[] = []
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    throw new ApiError('Unauthorized', 401);
  }

  const userRole = token.role as UserRole;
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  return { userId: token.sub, role: userRole };
}

/**
 * GET /api/security/events
 * Fetch security events with role-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await authorize(request, ['buyer', 'seller', 'admin']);
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Build filter conditions
    const where: any = {};

    // Type filter
    if (query.type) {
      where.type = {
        in: query.type.split(',') as SecurityEventType[],
      };
    }

    // Status filter
    if (query.status) {
      where.status = {
        in: query.status.split(',') as SecurityEventStatus[],
      };
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    // Role-based filtering
    if (role !== 'admin') {
      where.OR = [
        { userId },
        { type: { notIn: [SecurityEventType.ROLE_CHANGE, SecurityEventType.PERMISSION_CHANGE] } },
      ];
    }

    // Execute query with pagination
    const take = query.limit ? parseInt(query.limit) : 100;
    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return ApiResponse.success({ events, total });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error);
    }
    console.error('Security Events Error:', error);
    return ApiResponse.error('Failed to fetch security events');
  }
}

/**
 * POST /api/security/events
 * Create a new security event
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await authorize(request, ['buyer', 'seller', 'admin']);
    const data = await request.json();
    const event = eventSchema.parse(data) as SecurityEventCreateInput;

    // Only admins can create certain event types
    if (
      role !== 'admin' &&
      [SecurityEventType.ROLE_CHANGE, SecurityEventType.PERMISSION_CHANGE].includes(event.type)
    ) {
      throw new ApiError('Unauthorized event type', 403);
    }

    // Create event
    const securityEvent = await prisma.securityEvent.create({
      data: {
        ...event,
        userId,
        timestamp: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return ApiResponse.success({ event: securityEvent }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error);
    }
    if (error instanceof z.ZodError) {
      return ApiResponse.error('Invalid event data', 400, {
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    console.error('Create Security Event Error:', error);
    return ApiResponse.error('Failed to create security event');
  }
}

/**
 * DELETE /api/security/events/:id
 * Delete a security event (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await authorize(request, ['admin']);

    await prisma.securityEvent.delete({
      where: { id: params.id },
    });

    return ApiResponse.success({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error);
    }
    console.error('Delete Security Event Error:', error);
    return ApiResponse.error('Failed to delete security event');
  }
}