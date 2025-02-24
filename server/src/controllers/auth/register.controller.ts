import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/api-response';
import { RegisterData, AuthResponse } from '@/types/auth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import { ApiException } from '@/lib/utils/error-handler';

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as RegisterData;

    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      throw new ApiException(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('All fields'), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ApiException(ERROR_MESSAGES.AUTH.USER_EXISTS, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create new user with default role and account level
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: 'user',            // Default role
        accountLevel: 'buyer',   // Default account level
        status: 'pending',       // Default status
        isVerified: false,
        // Handle avatar upload separately if provided
        ...(data.avatar && { image: 'placeholder_url' }) // TODO: Implement file upload
      }
    });

    // Generate auth token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountLevel: user.accountLevel
    });

    // Create response without sensitive data
    const response: AuthResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountLevel: user.accountLevel,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken: token,
        refreshToken: token, // TODO: Implement refresh token logic
      }
    };

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    return ApiResponse.success(
      response,
      SUCCESS_MESSAGES.AUTH.REGISTER,
      201
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    
    console.error('Registration error:', error);
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ApiResponse.cors();
}