import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { User } from '@/lib/types';
import { ErrorMessages } from '@/lib/utils/error-handler';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: ErrorMessages.AUTH.SESSION_EXPIRED,
          data: null,
        },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as { userId: string };

      // For development testing
      if (process.env.NEXT_PUBLIC_ENABLE_TEST_ACCOUNT === 'true') {
        const testUser: User = {
          id: decoded.userId,
          email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL!,
          name: 'Test User',
          role: 'user',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferences: {
            theme: 'system',
            notifications: true,
          },
        };

        return NextResponse.json({
          success: true,
          message: 'User fetched successfully',
          data: testUser,
        });
      }

      // In production, fetch user from database using decoded.userId
      throw new Error('User not found');
    } catch (error) {
      // Token is invalid or expired
      cookies().delete('auth_token');
      return NextResponse.json(
        {
          success: false,
          message: ErrorMessages.AUTH.SESSION_EXPIRED,
          data: null,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: ErrorMessages.API.SERVER_ERROR,
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: ErrorMessages.AUTH.SESSION_EXPIRED,
          data: null,
        },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string };
    const updates = await req.json();

    // For development testing
    if (process.env.NEXT_PUBLIC_ENABLE_TEST_ACCOUNT === 'true') {
      const testUser: User = {
        id: decoded.userId,
        email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL!,
        name: updates.name || 'Test User',
        role: 'user',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          ...updates.preferences,
          theme: updates.preferences?.theme || 'system',
          notifications: updates.preferences?.notifications ?? true,
        },
      };

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        data: testUser,
      });
    }

    // In production, update user in database using decoded.userId and updates
    throw new Error('User not found');
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: ErrorMessages.API.SERVER_ERROR,
        data: null,
      },
      { status: 500 }
    );
  }
}