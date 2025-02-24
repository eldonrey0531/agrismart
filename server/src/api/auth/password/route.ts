import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { ApiResponse, ApiError } from '@/lib/api';
import { security } from '@/hooks/use-security';

// Password validation schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

/**
 * POST /api/auth/password
 * Change password endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      throw ApiError.unauthorized();
    }

    // Validate request body
    const data = await request.json();
    
    try {
      const validatedData = passwordChangeSchema.parse(data);

      // Check password status
      const status = await security.checkPasswordStatus();
      
      if (!status.requiresChange && status.lastChanged) {
        const minAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const timeSinceChange = Date.now() - status.lastChanged.getTime();
        
        if (timeSinceChange < minAge) {
          throw ApiError.forbidden('Password was changed too recently');
        }
      }

      // Get request metadata
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Update password
      await security.updatePassword(
        validatedData.currentPassword,
        validatedData.newPassword
      );

      // Record security event
      await security.recordEvent({
        id: crypto.randomUUID(),
        userId: token.sub!,
        type: 'password_change',
        status: 'success',
        severity: 'medium',
        ipAddress,
        userAgent,
        createdAt: new Date(),
      });

      return ApiResponse.success(
        { 
          message: 'Password changed successfully',
          requiresReLogin: true
        },
        200,
        { actionTaken: 'password_change' }
      );

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ApiError.validation(
          'Invalid password data',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        );
      }
      throw error;
    }

  } catch (error) {
    return ApiResponse.error(error);
  }
}

/**
 * GET /api/auth/password
 * Get password status
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      throw ApiError.unauthorized();
    }

    const status = await security.checkPasswordStatus();
    return ApiResponse.success(status);
    
  } catch (error) {
    return ApiResponse.error(error);
  }
}