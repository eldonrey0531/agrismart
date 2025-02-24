import { NextRequest, NextResponse } from 'next/server';
import { AUTH, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/lib/api-response';
import { verifyToken } from '@/lib/jwt';
import { ApiException } from '@/lib/utils/error-handler';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get token from authorization header
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (token) {
      try {
        // Verify token to get user info
        const decoded = verifyToken(token);
        const userId = decoded.user.id;

        // Update user's last activity
        await prisma.user.update({
          where: { id: userId },
          data: {
            updatedAt: new Date()
          }
        });

        // TODO: Record logout activity
        // await recordActivity({
        //   userId,
        //   type: 'LOGOUT',
        //   ip: req.ip,
        //   userAgent: req.headers.get('user-agent')
        // });

      } catch (error) {
        // Ignore token verification errors during logout
        console.warn('Token verification failed during logout:', error);
      }
    }

    // Create response that clears the auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTH.LOGOUT
      },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set(AUTH.TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    // TODO: If using refresh tokens, invalidate them here
    // await invalidateRefreshToken(token);

    return response;

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    
    console.error('Logout error:', error);
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Handle invalid methods
export async function GET() {
  return ApiResponse.error('Method not allowed', 405);
}

export async function PUT() {
  return ApiResponse.error('Method not allowed', 405);
}

export async function DELETE() {
  return ApiResponse.error('Method not allowed', 405);
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ApiResponse.cors();
}