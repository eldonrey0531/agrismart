import NextAuth from "next-auth"
import type { NextAuthConfig, User as NextAuthUser } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { models } from "@/server/models"
import type { IUser } from "@/server/models"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: UserRole
      accountLevel: AccountLevel
    }
  }

  interface User extends NextAuthUser {
    role: UserRole
    accountLevel: AccountLevel
    status: UserStatus
    twoFactorEnabled: boolean
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    accountLevel: AccountLevel
  }
}

// Custom types
export type UserRole = "USER" | "ADMIN" | "MODERATOR"
export type AccountLevel = "BASIC" | "SELLER"
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED"

// MongoDB client for the adapter
const client = new MongoClient(process.env.MONGODB_URI!)

export const authConfig = {
  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-email",
    error: "/error/auth",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await models.User.findOne({ email: credentials.email }).lean()

        if (!user) {
          throw new Error("Email not found")
        }

        if (!user.password) {
          throw new Error("Password not set for this account")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid password")
        }

        if (!user.emailVerified) {
          throw new Error("Email not verified")
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is not active")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          accountLevel: user.accountLevel as AccountLevel,
          status: user.status as UserStatus,
          twoFactorEnabled: user.twoFactorEnabled
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | null }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accountLevel = user.accountLevel
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.accountLevel = token.accountLevel
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Helper to get the current user's complete data from database
export async function getCurrentUser(userId: string): Promise<IUser | null> {
  try {
    return await models.User.findById(userId).lean()
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}