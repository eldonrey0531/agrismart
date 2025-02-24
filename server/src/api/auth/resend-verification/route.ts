import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { emailVerificationService } from '@/server/express/services/EmailVerificationService';
import { 
  createUnauthorizedResponse, 
  createServerErrorResponse, 
  createSuccessResponse,
  createValidationErrorResponse,
} from '@/lib/api-response';
import { cookies } from 'next/headers';
import { TokenPayload } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth token
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const decodedToken = await verifyJwt<TokenPayload>(token);
    if (!decodedToken?.userId) {
      return createUnauthorizedResponse('Invalid authentication token');
    }

    // Check if request body contains the necessary data
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return createValidationErrorResponse('Email is required');
    }

    // Resend verification email
    await emailVerificationService.resendVerificationEmail(decodedToken.userId);

    return createSuccessResponse(
      undefined,
      'Verification email sent successfully. Please check your inbox.'
    );
  } catch (error) {
    // Handle rate limit error specifically
    if (error instanceof Error && error.message.includes('Please wait')) {
      return createValidationErrorResponse(error.message);
    }

    console.error('[RESEND_VERIFICATION_ERROR]', error);
    return createServerErrorResponse(
      'An error occurred while sending verification email',
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