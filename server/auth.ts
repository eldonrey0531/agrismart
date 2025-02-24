import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUser } from "./models/user";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

async function authenticateUser(credentials: { email?: string, password?: string }) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  try {
    // For testing purposes only - in development
    if (process.env.NEXT_PUBLIC_ENABLE_TEST_ACCOUNT === "true" &&
        credentials.email === process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL &&
        credentials.password === process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD) {
      return {
        id: "test-user",
        email: credentials.email as string,
        name: "Test User",
      };
    }

    // Get the User model and database connection
    const { UserModel, connectToDatabase } = await getUser();

    // Ensure MongoDB connection
    await connectToDatabase();

    // Find user in database
    const user = await UserModel.findOne({ email: credentials.email });
    if (!user) {
      console.log("User not found:", credentials.email);
      return null;
    }

    // Verify password
    const isValidPassword = await user.comparePassword(credentials.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", credentials.email);
      return null;
    }

    // Return user without password
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || null,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (typeof credentials !== 'undefined') {
          return authenticateUser(credentials);
        }
        return null;
      }
    })
  ],
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
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { 
  auth, 
  handlers: { GET, POST }, 
  signIn, 
  signOut 
} = NextAuth(authConfig);
