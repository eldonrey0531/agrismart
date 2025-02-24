import type { NextAuthConfig } from "next-auth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

export const authConfig: NextAuthConfig = {
  providers: [], // Empty array to satisfy type requirements, real providers added in route.ts
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      return !!user?.email;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ['/chat', '/profile', '/marketplace'];
      const isProtected = protectedPaths.some(path => 
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected) return isLoggedIn;
      return true;
    }
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};