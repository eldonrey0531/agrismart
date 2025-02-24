import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  hasCommunityPermission,
  canManageContent,
  getModerationSettings,
  needsModeration,
  type CommunityAction,
  type ContentType,
  type ModerationStatus
} from '@/lib/community/access-control';
import { ApiError } from '@/lib/error';
import { ApiResponse } from '@/lib/api-response';
import type { UserRole } from '@/lib/auth/roles';

/**
 * Verify community permission middleware
 */
async function verifyPermission(
  request: NextRequest,
  action: CommunityAction
): Promise<{ userId: string; role: UserRole }> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    throw new ApiError('Unauthorized', 401);
  }

  const role = token.role as UserRole;
  
  if (!hasCommunityPermission(role, action)) {
    throw new ApiError('Insufficient permissions for this action', 403);
  }

  return { userId: token.sub!, role };
}

/**
 * GET /api/community/posts
 * List posts with role-based visibility
 */
export async function GET(request: NextRequest) {
  try {
    const { role } = await verifyPermission(request, 'view_content');
    const { searchParams } = new URL(request.url);
    
    // Apply role-based filters
    const filters: Record<string, any> = {
      status: role === 'admin' ? undefined : 'approved'
    };
    
    // Add query filters
    if (searchParams.has('category')) {
      filters.category = searchParams.get('category');
    }

    // TODO: Implement actual post fetching logic
    const posts = []; // Fetch from database with filters

    return ApiResponse.success({ posts });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to fetch posts', 500);
  }
}

/**
 * POST /api/community/posts
 * Create new post with moderation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await verifyPermission(request, 'create_post');
    const data = await request.json();

    const moderationSettings = getModerationSettings(role, 'post');
    const initialStatus: ModerationStatus = moderationSettings.autoApprove ? 'approved' : 'pending';

    // Create post with moderation status
    const post = {
      ...data,
      authorId: userId,
      createdAt: new Date(),
      status: initialStatus,
      moderationQueue: moderationSettings.moderationQueue,
      needsReview: moderationSettings.requiresReview
    };

    // TODO: Save to database

    return ApiResponse.success({ post }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to create post', 500);
  }
}

/**
 * PUT /api/community/posts/:id
 * Update post with permission check
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role } = await verifyPermission(request, 'update_post');
    const data = await request.json();

    // TODO: Fetch post and verify ownership
    const post = { authorId: '' }; // Placeholder

    if (!canManageContent(role, post.authorId, userId, 'post')) {
      throw new ApiError('Cannot modify this content', 403);
    }

    // TODO: Update post in database

    return ApiResponse.success({ message: 'Post updated successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to update post', 500);
  }
}

/**
 * DELETE /api/community/posts/:id
 * Delete post with permission check
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role } = await verifyPermission(request, 'delete_post');

    // TODO: Fetch post and verify ownership
    const post = { authorId: '' }; // Placeholder

    if (!canManageContent(role, post.authorId, userId, 'post')) {
      throw new ApiError('Cannot delete this content', 403);
    }

    // TODO: Delete or mark post as deleted

    return ApiResponse.success({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to delete post', 500);
  }
}

/**
 * POST /api/community/moderate
 * Moderate content (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { role } = await verifyPermission(request, 'moderate_content');
    const { contentId, action, reason } = await request.json();

    // Verify admin role
    if (role !== 'admin') {
      throw new ApiError('Only administrators can moderate content', 403);
    }

    // TODO: Implement moderation action
    // Update content status, add moderation log, etc.

    return ApiResponse.success({ 
      message: 'Content moderated successfully',
      status: action
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to moderate content', 500);
  }
}