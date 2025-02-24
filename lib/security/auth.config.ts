import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectDB } from "@/lib/db/client"
import { models } from "@/server/models"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: string
      accountLevel: string
    }
  }

  interface User {
    role: string
    accountLevel: string
    status: string
    twoFactorEnabled: boolean
  }
}

export const authConfig = {
  adapter: MongoDBAdapter(connectDB),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-email",
    error: "/error/auth",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await models.User.findOne({ email: credentials.email })

        if (!user) {
          throw new Error("Email not found")
        }

        if (!user.password) {
          throw new Error("Password not set for this account")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

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
          role: user.role,
          accountLevel: user.accountLevel,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accountLevel = user.accountLevel
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.accountLevel = token.accountLevel as string
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)