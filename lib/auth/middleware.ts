import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { hasRole } from '@/lib/auth'
import type { UserRole } from '@/types/next-auth'

export async function authMiddleware(request: NextRequest) {
  const session = await auth()
  const { nextUrl } = request
  const isLoggedIn = !!session?.user

  // Handle admin routes
  if (nextUrl.pathname.startsWith('/api/admin') || nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!isLoggedIn) {
      const redirectUrl = new URL('/login', nextUrl.origin)
      redirectUrl.searchParams.set('callbackUrl', nextUrl.href)
      return NextResponse.redirect(redirectUrl)
    }

    if (!session?.user?.role || !hasRole({ role: session.user.role }, 'ADMIN' as UserRole)) {
      return NextResponse.redirect(new URL('/403', nextUrl.origin))
    }
  }

  // Handle protected routes
  if (
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/api/user') ||
    nextUrl.pathname.startsWith('/api/chat') ||
    nextUrl.pathname.startsWith('/profile')
  ) {
    if (!isLoggedIn) {
      const redirectUrl = new URL('/login', nextUrl.origin)
      redirectUrl.searchParams.set('callbackUrl', nextUrl.href)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle public routes
  return NextResponse.next()
}

export async function getSessionUser(request: NextRequest) {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}