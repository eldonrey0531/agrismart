import { NextRequest } from 'next/server';
import { verifyJwt, signJwtAccessToken } from '@/lib/jwt';
import { emailVerificationService } from '@/server/express/services/EmailVerificationService';
import { createValidationErrorResponse, createServerErrorResponse, createSuccessResponse } from '@/lib/api-response';
import { cookies } from 'next/headers';
import { TokenPayload } from '@/lib/jwt';
import { toAuthUser } from '@/server/express/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return createValidationErrorResponse('Verification token is required');
    }

    // Verify the token
    const decodedToken = await verifyJwt<TokenPayload>(token);
    if (!decodedToken?.userId) {
      return createValidationErrorResponse('Invalid verification token');
    }

    // Verify the email
    const userDoc = await emailVerificationService.verifyEmail(token);
    const user = toAuthUser(userDoc);

    // Generate new access token with updated verification status
    const accessToken = await signJwtAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      isVerified: true,
    });

    // Update auth token cookie
    const cookieStore = cookies();
    cookieStore.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: true,
          mobile: user.mobile,
          accountLevel: user.accountLevel,
          notificationPreferences: user.notificationPreferences,
        },
        accessToken,
      },
      'Email verified successfully'
    );
  } catch (error) {
    console.error('[EMAIL_VERIFICATION_ERROR]', error);
    return createServerErrorResponse(
      'An error occurred during email verification',
      error instanceof Error ? error : undefined
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}