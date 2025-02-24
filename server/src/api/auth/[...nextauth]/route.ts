import NextAuth from "next-auth";
import type { NextAuthConfig, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { AuthErrorCode } from "@/lib/types/auth";

// The base user type that matches NextAuth's requirements
type AuthUser = User & {
  role: string;
  accountLevel: string;
  status: string;
  twoFactorEnabled: boolean;
  isVerified: boolean;
  accessToken: string;
  refreshToken: string;
};

export const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isVerified: true,
              status: true,
              image: true,
            },
          });

          if (!user) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          if (!user.isVerified) {
            throw new Error(AuthErrorCode.EMAIL_NOT_VERIFIED);
          }

          if (user.status === "suspended") {
            throw new Error(AuthErrorCode.ACCOUNT_SUSPENDED);
          }

          // Return user data with required fields
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            accountLevel: "basic",
            status: user.status,
            twoFactorEnabled: false,
            isVerified: user.isVerified,
            accessToken: "",
            refreshToken: "",
          } as AuthUser;
        } catch (error) {
          console.error("[AUTH_ERROR]", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          accountLevel: user.accountLevel,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
          isVerified: user.isVerified,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          role: token.role as string,
          accountLevel: token.accountLevel as string,
          status: token.status as string,
          twoFactorEnabled: Boolean(token.twoFactorEnabled),
          isVerified: Boolean(token.isVerified),
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
    verifyRequest: "/verify-email",
    newUser: "/signup",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;

const handler = NextAuth(options);
export { handler as GET, handler as POST };
export const config = options;