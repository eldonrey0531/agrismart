import type { NextAuthConfig } from "next-auth";
import type { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials } from "@/server/db/user";

interface AuthCredentials {
  email: string;
  password: string;
}

function isCredentials(credentials: any): credentials is AuthCredentials {
  return (
    credentials &&
    typeof credentials.email === 'string' &&
    typeof credentials.password === 'string'
  );
}

export const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { 
        label: "Email", 
        type: "email",
        placeholder: "example@example.com"
      },
      password: { 
        label: "Password", 
        type: "password"
      }
    },
    async authorize(credentials): Promise<User | null> {
      if (!isCredentials(credentials)) {
        return null;
      }

      try {
        // Test account check
        if (process.env.NEXT_PUBLIC_ENABLE_TEST_ACCOUNT === "true" &&
            credentials.email === process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL &&
            credentials.password === process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD) {
          return {
            id: "test-user",
            email: credentials.email,
            name: "Test User",
          };
        }

        // Validate credentials against database
        const user = await validateUserCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          return null;
        }

        // Return user data in the format expected by NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    }
  })
] satisfies NextAuthConfig["providers"];