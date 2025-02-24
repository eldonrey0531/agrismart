import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/jwt-utils';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

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
      { success: false, message: 'Invalid session' },
      { status: 401 }
    );
  }
}