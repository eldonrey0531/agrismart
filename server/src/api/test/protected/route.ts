import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Protected data accessed',
      user: {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        accountLevel: token.accountLevel,
        status: token.status
      }
    })
  } catch (error) {
    console.error('Protected route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}