import type { AuthConfig, Session, User } from "next-auth";
import { JWT } from "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      role: "user" | "admin" | "moderator";
      isVerified: boolean;
    };
    token: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: "user" | "admin" | "moderator";
    isVerified: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: "user" | "admin" | "moderator";
    isVerified: boolean;
    accessToken: string;
    refreshToken: string;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
    verifyRequest: "/verify-email",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: Session | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/api/") || 
                         nextUrl.pathname.startsWith("/chat") ||
                         nextUrl.pathname.startsWith("/marketplace") ||
                         nextUrl.pathname.startsWith("/profile") ||
                         nextUrl.pathname.startsWith("/settings") ||
                         nextUrl.pathname.startsWith("/dashboard");

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.token = token.accessToken;
      }
      return session;
    },
  },
  providers: [], // Providers will be added in auth.ts
} satisfies AuthConfig;