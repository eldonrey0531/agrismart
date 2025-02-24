import NextAuth from "next-auth";
import type { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { api } from "./api/client";
import type { AuthResponse } from "@/types/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
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
    accessToken: string;
    refreshToken: string;
  }
}

export const authOptions: AuthOptions = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const response = await api.post<AuthResponse>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          if (!response.success) {
            throw new Error(response.error || "Authentication failed");
          }

          return {
            ...response.user,
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes
  },
  events: {
    async signOut({ token }: { token: { accessToken: string } }) {
      try {
        await api.post("/auth/logout", null, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);