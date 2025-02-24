import { NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/utils/jwt-utils';

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    // Return user info
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}