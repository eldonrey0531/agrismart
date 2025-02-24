import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateRefreshToken } from '@/lib/auth/session';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/api-response';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, AUTH } from '@/lib/constants';
import { ApiException } from '@/lib/utils/error-handler';
import { getClientIp, getUserAgent, getRequestInfo } from '@/lib/utils/request';
import { getLocationFromIp, formatLocation } from '@/lib/utils/geo';
import { parseUserAgent, formatDeviceInfo } from '@/lib/utils/device';

type ValidRole = typeof AUTH.ROLES[keyof typeof AUTH.ROLES];
type ValidAccountLevel = typeof AUTH.ACCOUNT_LEVELS[keyof typeof AUTH.ACCOUNT_LEVELS];
type ValidStatus = typeof AUTH.STATUS[keyof typeof AUTH.STATUS];

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as LoginCredentials;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // For logging and tracking
    const requestInfo = getRequestInfo(req);

    // Validate required fields
    if (!data.email || !data.password) {
      await recordLoginAttempt({
        email: data.email,
        status: 'failed',
        reason: 'Missing required fields',
        ipAddress,
        userAgent
      });
      throw new ApiException(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('Email and password'), 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      await recordLoginAttempt({
        email: data.email,
        status: 'failed',
        reason: 'User not found',
        ipAddress,
        userAgent
      });
      throw new ApiException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      await recordLoginAttempt({
        email: data.email,
        userId: user.id,
        status: 'failed',
        reason: 'Invalid password',
        ipAddress,
        userAgent
      });
      throw new ApiException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
    }

    // Validate role and account level
    const userRole = user.role as ValidRole;
    const userAccountLevel = user.accountLevel as ValidAccountLevel;
    const userStatus = user.status as ValidStatus;

    if (!Object.values(AUTH.ROLES).includes(userRole)) {
      throw new ApiException('Invalid user role', 500);
    }

    if (userAccountLevel && !Object.values(AUTH.ACCOUNT_LEVELS).includes(userAccountLevel)) {
      throw new ApiException('Invalid account level', 500);
    }

    // Check account status
    if (userStatus === AUTH.STATUS.SUSPENDED) {
      await recordLoginAttempt({
        email: data.email,
        userId: user.id,
        status: 'failed',
        reason: 'Account suspended',
        ipAddress,
        userAgent
      });
      throw new ApiException(ERROR_MESSAGES.AUTH.ACCOUNT_SUSPENDED, 403);
    }

    // Check email verification if required
    if (!user.isVerified) {
      await recordLoginAttempt({
        email: data.email,
        userId: user.id,
        status: 'failed',
        reason: 'Email not verified',
        ipAddress,
        userAgent
      });
      throw new ApiException(ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED, 403);
    }

    // Generate auth token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: userRole,
      accountLevel: userAccountLevel
    });

    // Generate refresh token if remember me is true
    let refreshToken = null;
    if (data.remember) {
      refreshToken = await generateRefreshToken(user.id, ipAddress);
    }

    // Record successful login
    await recordLoginAttempt({
      email: data.email,
      userId: user.id,
      status: 'success',
      ipAddress,
      userAgent
    });

    // Create response
    const response: AuthResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
        accountLevel: userAccountLevel,
        status: userStatus,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken: token,
        refreshToken: refreshToken || token,
      }
    };

    // Create response with cookie if remember me is true
    const responseWithCookie = ApiResponse.success(
      response,
      SUCCESS_MESSAGES.AUTH.LOGIN
    );

    if (data.remember) {
      responseWithCookie.cookies.set(AUTH.TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: AUTH.COOKIE_MAX_AGE
      });
    }

    return responseWithCookie;

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    
    console.error('Login error:', error);
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

async function recordLoginAttempt({
  email,
  userId,
  status,
  reason,
  ipAddress,
  userAgent
}: {
  email: string;
  userId?: string;
  status: 'success' | 'failed';
  reason?: string;
  ipAddress: string;
  userAgent: string;
}) {
  try {
    // Get location from IP and device info
    const [location, deviceInfo] = await Promise.all([
      getLocationFromIp(ipAddress),
      Promise.resolve(parseUserAgent(userAgent))
    ]);

    await prisma.loginEvent.create({
      data: {
        userId: userId || undefined,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        status,
        reason,
        location: location ? formatLocation(location) : undefined,
        device: formatDeviceInfo(deviceInfo)
      }
    });
  } catch (error) {
    // Log error but don't throw to prevent login process interruption
    console.error('Failed to record login attempt:', error);
  }
}