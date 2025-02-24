import { type Session as NextAuthSession } from 'next-auth'
import { UserRole, AccountLevel, UserStatus } from '@/lib/auth/types'

declare module 'next-auth' {
  interface Session extends NextAuthSession {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      accountLevel: AccountLevel
      status: UserStatus
      twoFactorEnabled: boolean
      twoFactorVerified?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
    accountLevel: AccountLevel
    status: UserStatus
    twoFactorEnabled: boolean
    twoFactorVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
    accountLevel: AccountLevel
    status: UserStatus
    twoFactorEnabled: boolean
    twoFactorVerified?: boolean
  }
}

// Export session type for use in application
export type AuthSession = NextAuthSession & {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
    accountLevel: AccountLevel
    status: UserStatus
    twoFactorEnabled: boolean
    twoFactorVerified?: boolean
  }
}