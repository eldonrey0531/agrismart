import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/error';
import { authenticateUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTOTP, generateRecoveryCodes } from '@/lib/auth/totp';
import { securityClient } from '@/lib/security/client';
import { getClientInfo } from '@/lib/utils/request';

/**
 * Enable 2FA endpoint
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await authenticateUser(req);
    if (!user) {
      throw new ApiError('Unauthorized', 401);
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      throw new ApiError('Two-factor authentication is already enabled', 400);
    }

    // Generate TOTP secret and QR code
    const { secret, qrCode } = await generateTOTP(user.email);

    // Generate recovery codes
    const recoveryCodes = await generateRecoveryCodes();

    // Store temporary setup data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorRecoveryCodes: recoveryCodes,
        twoFactorTempData: {
          setupStarted: new Date(),
          verified: false
        }
      }
    });

    // Log security event
    const clientInfo = await getClientInfo(req);
    await securityClient.security.recordLoginEvent({
      userId: user.id,
      type: 'two_factor_setup',
      status: 'pending',
      severity: 'high',
      ...clientInfo,
      metadata: {
        setupStarted: new Date()
      }
    });

    return ApiResponse.success({
      secret,
      qrCode,
      recoveryCodes
    });
  } catch (error) {
    console.error('2FA Enable Error:', error);
    
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }

    return ApiResponse.error(
      'An error occurred while enabling two-factor authentication',
      500
    );
  }
}