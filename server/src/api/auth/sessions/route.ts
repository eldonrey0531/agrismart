import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/jwt';
import { ApiException } from '@/lib/utils/error-handler';
import { ERROR_MESSAGES } from '@/lib/constants';
import { getClientIp, getRequestInfo } from '@/lib/utils/request';
import {
  getUserSessions,
  revokeRefreshToken,
  revokeAllUserSessions
} from '@/lib/auth/session';

// Get all active sessions for the current user
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

    // Get active sessions
    const sessions = await getUserSessions(userId);

    // Transform session data for client
    const sessionData = sessions.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      expires: session.expires,
      createdByIp: session.createdByIp,
      isCurrentSession: session.token === token,
      device: session.createdByIp === getClientIp(req) ? 'current' : 'other'
    }));

    return ApiResponse.success(
      { sessions: sessionData },
      'Active sessions retrieved successfully'
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Revoke a specific session
export async function DELETE(req: NextRequest) {
  try {
    // Get token from authorization header
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Get session token to revoke from request
    const { sessionToken } = await req.json();
    if (!sessionToken) {
      throw new ApiException('Session token is required', 400);
    }

    // Verify current user's token
    const decoded = verifyToken(token);
    const userId = decoded.user.id;

    // Get session to revoke
    const sessions = await getUserSessions(userId);
    const sessionToRevoke = sessions.find(s => s.token === sessionToken);

    if (!sessionToRevoke) {
      throw new ApiException('Invalid session token', 400);
    }

    // Revoke the session
    await revokeRefreshToken(
      sessionToken,
      getClientIp(req)
    );

    // Log session revocation
    console.info('Session revoked:', {
      ...getRequestInfo(req),
      userId,
      sessionId: sessionToRevoke.id
    });

    return ApiResponse.success(
      null,
      'Session revoked successfully'
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Revoke all sessions except current
export async function PUT(req: NextRequest) {
  try {
    // Get token from authorization header
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    const userId = decoded.user.id;

    // Get keepCurrent from request body
    const { keepCurrent } = await req.json();

    // Revoke all sessions
    await revokeAllUserSessions(
      userId,
      getClientIp(req),
      keepCurrent ? token : undefined
    );

    // Log mass session revocation
    console.info('All sessions revoked:', {
      ...getRequestInfo(req),
      userId,
      keepCurrent
    });

    return ApiResponse.success(
      null,
      'All sessions revoked successfully'
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