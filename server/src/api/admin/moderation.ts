import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ApiResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/error';
import { prisma } from '@/lib/prisma';
import type { ModerationStatus, ContentType } from '@/lib/community/access-control';

/**
 * Verify admin access
 */
async function verifyAdminAccess(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token || token.role !== 'admin') {
    throw new ApiError('Unauthorized: Admin access required', 403);
  }

  return token;
}

/**
 * GET /api/admin/moderation
 * Get content for moderation
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAccess(request);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as ModerationStatus;
    const type = searchParams.get('type') as ContentType | 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const where: any = {
      ...(status && { status }),
      ...(type !== 'all' && { type }),
      deletedAt: null
    };

    // Fetch content with pagination
    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reports: {
            select: {
              id: true,
              reason: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.content.count({ where })
    ]);

    return ApiResponse.success({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to fetch moderation queue', 500);
  }
}

/**
 * PATCH /api/admin/moderation
 * Update content moderation status
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = await verifyAdminAccess(request);
    const data = await request.json();
    
    const {
      ids,
      action: { status, reason }
    } = data;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError('Invalid content selection', 400);
    }

    // Update content status
    await prisma.$transaction(async (tx) => {
      // Update content items
      await tx.content.updateMany({
        where: { id: { in: ids } },
        data: { status }
      });

      // Create moderation log entries
      await tx.moderationLog.createMany({
        data: ids.map(contentId => ({
          contentId,
          moderatorId: token.sub!,
          action: status,
          reason,
          createdAt: new Date()
        }))
      });

      // If content is rejected/removed, handle reports
      if (status === 'rejected' || status === 'removed') {
        await tx.report.updateMany({
          where: { contentId: { in: ids } },
          data: { resolved: true, resolvedAt: new Date() }
        });
      }
    });

    return ApiResponse.success({
      message: `Successfully updated ${ids.length} items`,
      status
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to update moderation status', 500);
  }
}

/**
 * GET /api/admin/moderation/stats
 * Get moderation statistics
 */
export async function GET_STATS(request: NextRequest) {
  try {
    await verifyAdminAccess(request);

    const stats = await prisma.content.groupBy({
      by: ['status'],
      _count: true
    });

    const reportStats = await prisma.report.aggregate({
      _count: {
        _all: true,
        resolved: true
      }
    });

    return ApiResponse.success({
      contentStats: stats,
      reportStats: {
        total: reportStats._count._all,
        resolved: reportStats._count.resolved,
        pending: reportStats._count._all - reportStats._count.resolved
      }
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to fetch moderation stats', 500);
  }
}