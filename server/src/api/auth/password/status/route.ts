import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/jwt';
import { securityClient } from '@/lib/security/client';
import { ApiError } from '@/lib/error';
import { 
  checkPasswordSecurity,
  checkPasswordExpiry,
  getPasswordStatusMessage
} from '@/lib/notifications/security-alerts';
import type { UserWithSecurity } from '@/types/prisma';
import type { PasswordSecurityStatus } from '@/types/server';

interface PasswordStatusResponse {
  status: PasswordSecurityStatus;
  message: string;
  requiresAction: boolean;
  nextCheck?: Date;
  recommendations: string[];
}

/**
 * Get password security status for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Validate token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError('Unauthorized', 401);
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded?.sub) {
      throw new ApiError('Invalid token', 401);
    }

    // Get user with security info
    const user = await securityClient.security.findWithSecurity(decoded.sub);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check password status
    const status = await checkPasswordSecurity(user);
    const expiry = await checkPasswordExpiry(user);
    const message = getPasswordStatusMessage(expiry);

    // Determine if immediate action is required
    const requiresAction = status.requiresChange || 
      status.strength === 'weak' || 
      expiry.daysUntilExpiry <= 7; // Urgent if expiring within a week

    // Set next check based on status
    const nextCheck = new Date();
    if (status.strength === 'strong') {
      nextCheck.setDate(nextCheck.getDate() + 30); // Check monthly
    } else if (status.strength === 'medium') {
      nextCheck.setDate(nextCheck.getDate() + 7); // Check weekly
    } else {
      nextCheck.setDate(nextCheck.getDate() + 1); // Check daily
    }

    const response: PasswordStatusResponse = {
      status,
      message,
      requiresAction,
      nextCheck,
      recommendations: status.recommendations
    };

    // Log status check if there are issues
    if (requiresAction || status.recommendations.length > 0) {
      await securityClient.security.recordLoginEvent({
        userId: user.id,
        type: 'password_check',
        status: requiresAction ? 'blocked' : 'pending',
        severity: requiresAction ? 'high' : 'medium',
        ipAddress: 'system',
        userAgent: 'system',
        device: 'system',
        metadata: {
          strength: status.strength,
          daysUntilExpiry: expiry.daysUntilExpiry,
          requiresAction,
          recommendationCount: status.recommendations.length
        }
      });
    }

    return ApiResponse.success(response);

  } catch (error) {
    console.error('Password status check error:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }

    return ApiResponse.error(
      'An error occurred while checking password status',
      500
    );
  }
}

/**
 * Pre-flight request handler
 */
export async function OPTIONS() {
  return ApiResponse.cors();
}