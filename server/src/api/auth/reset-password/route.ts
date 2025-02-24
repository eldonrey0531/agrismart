import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { authService } from '@/server/express/services/AuthService';
import { createApiResponse } from '@/lib/api-response';
import { cookies } from 'next/headers';
import { TokenPayload } from '@/lib/jwt';

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as ResetPasswordRequest;

    if (!token || !password) {
      return createApiResponse({
        success: false,
        message: 'Token and password are required',
        status: 400,
      });
    }

    if (password.length < 8) {
      return createApiResponse({
        success: false,
        message: 'Password must be at least 8 characters long',
        status: 400,
      });
    }

    const { user, token: newToken } = await authService.resetPassword(token, password);

    // Clear any existing auth tokens
    const cookieStore = cookies();
    cookieStore.delete('auth-token');
    cookieStore.delete('refresh-token');

    return createApiResponse({
      success: true,
      data: { 
        message: 'Password has been reset successfully. Please login with your new password.',
        user,
        token: newToken,
      },
      status: 200,
    });
  } catch (error) {
    console.error('[PASSWORD_RESET_ERROR]', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return createApiResponse({
          success: false,
          message: error.message,
          status: 401,
        });
      }

      if (error.message.includes('Password')) {
        return createApiResponse({
          success: false,
          message: error.message,
          status: 400,
        });
      }
    }

    return createApiResponse({
      success: false,
      message: 'An error occurred during password reset',
      status: 500,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}