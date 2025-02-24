import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/error';
import { authenticateUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/auth/totp';
import { securityClient } from '@/lib/security/client';
import { getClientInfo } from '@/lib/utils/request';
import { z } from 'zod';

const verifySchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers')
});

/**
 * Verify 2FA setup and enable it for the account
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await authenticateUser(req);
    if (!user) {
      throw new ApiError('Unauthorized', 401);
    }

    // Validate request data
    const data = await req.json();
    const { code } = verifySchema.parse(data);

    // Get user's 2FA setup data
    const setupData = user.twoFactorTempData as any;
    if (!setupData?.setupStarted) {
      throw new ApiError('2FA setup has not been started', 400);
    }

    // Check if setup is still valid (within 10 minutes)
    const setupAge = Date.now() - new Date(setupData.setupStarted).getTime();
    if (setupAge > 10 * 60 * 1000) {
      throw new ApiError('Setup session expired. Please start over.', 400);
    }

    // Verify the code
    const isValid = verifyTOTP(code, user.twoFactorSecret!);
    if (!isValid) {
      throw new ApiError('Invalid verification code', 400);
    }

    const clientInfo = await getClientInfo(req);

    // Update user's 2FA status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
        twoFactorTempData: {
          setupCompleted: new Date(),
          verified: true,
          verifiedAt: new Date()
        },
        securityPreferences: {
          ...user.securityPreferences,
          twoFactorEnabled: true,
          twoFactorVerified: true,
          twoFactorSetup: {
            setupCompleted: new Date(),
            verified: true,
            verifiedAt: new Date(),
            recoveryCodesRemaining: user.twoFactorBackupCodes ? 
              (user.twoFactorBackupCodes as string[]).length : 
              0
          }
        }
      }
    });

    // Log the security event
    await securityClient.security.recordLoginEvent({
      userId: user.id,
      type: 'two_factor_enabled',
      status: 'success',
      severity: 'high',
      ...clientInfo,
      metadata: {
        setupCompleted: new Date(),
        method: 'app'
      }
    });

    return ApiResponse.success({
      enabled: true,
      verifiedAt: new Date()
    });

  } catch (error) {
    console.error('2FA Verification Error:', error);

    // Log failed attempt if it's a verification failure
    if (error instanceof ApiError && error.message === 'Invalid verification code') {
      const user = await authenticateUser(req);
      if (user) {
        const clientInfo = await getClientInfo(req);
        await securityClient.security.recordLoginEvent({
          userId: user.id,
          type: 'two_factor_failed',
          status: 'failed',
          severity: 'high',
          ...clientInfo,
          reason: 'Invalid verification code'
        });
      }
    }
    
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }

    return ApiResponse.error(
      'An error occurred while verifying two-factor authentication',
      500
    );
  }
}