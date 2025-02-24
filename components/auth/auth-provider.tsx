"use client";

import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  type AuthContextType,
  type AuthProviderProps,
  type AuthCredentials,
  type AuthError,
  type SignupInput,
  type SignupResponse,
  AuthStatus,
  authReducer,
  AUTH_ROUTES,
} from "@/lib/auth/types";
import { sessionToAuthToken, isSessionUser } from "@/lib/auth/guards";
import type { AuthSession } from "@/types/next-auth";
import type { Session as NextAuthSession } from "next-auth";

function assertIsAuthSession(session: NextAuthSession | null): asserts session is AuthSession {
  if (!session?.user) throw new Error("Invalid session");
  if (!isSessionUser(session.user)) throw new Error("Invalid session user");
}

// Initial auth context state
const initialState: AuthContextType = {
  user: null,
  status: AuthStatus.LOADING,
  error: null,
  signUp: async () => ({ success: false }),
  signIn: async () => {},
  signOut: async () => {},
  refresh: async () => {},
  dispatch: () => {},
};

// Create auth context
export const AuthContext = createContext<AuthContextType>(initialState);

// Auth provider component
export function AuthProvider({ children, onError, onSuccess }: AuthProviderProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus, update } = useSession();

  // Initialize state with reducer
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    status: AuthStatus.LOADING,
    error: null,
  });

  // Update state based on session
  useEffect(() => {
    if (sessionStatus === "loading") {
      dispatch({ type: "SET_LOADING" });
      return;
    }

    if (sessionStatus === "authenticated" && session) {
      try {
        assertIsAuthSession(session);
        const authToken = sessionToAuthToken(session);

        if (!authToken) {
          throw new Error("Failed to convert session to auth token");
        }

        dispatch({ type: "SET_USER", payload: authToken });
        onSuccess?.(authToken);

        // Check if 2FA is required but not verified
        if (authToken.twoFactorEnabled && !authToken.twoFactorVerified) {
          dispatch({ type: "SET_TWO_FACTOR_REQUIRED" });
          router.push(AUTH_ROUTES.VERIFY_2FA);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        dispatch({ type: "CLEAR_USER" });
        onError?.({ code: "INVALID_SESSION", message: (error as Error).message });
      }
    } else {
      dispatch({ type: "CLEAR_USER" });
    }
  }, [session, sessionStatus, router, onSuccess, onError]);

  // Sign up handler
  const handleSignUp = useCallback(
    async (data: SignupInput): Promise<SignupResponse> => {
      try {
        dispatch({ type: "SET_LOADING" });

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'profilePicture' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        });

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || "Failed to sign up");
        }

        // If email verification is required
        if (result.requiresVerification) {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
          router.push(AUTH_ROUTES.VERIFY_EMAIL);
          return { success: true, requiresVerification: true };
        }

        // If no verification required, log the user in
        await handleSignIn({
          email: data.email,
          password: data.password,
        });

        return { success: true };
      } catch (error) {
        const authError = error as AuthError;
        dispatch({ type: "SET_ERROR", payload: authError.message });
        onError?.(authError);

        toast({
          title: "Error",
          description: authError.message || "An error occurred during sign up",
          variant: "destructive",
        });

        return { success: false, error: authError.message };
      }
    },
    [router, onError]
  );

  // Sign in handler
  const handleSignIn = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        dispatch({ type: "SET_LOADING" });

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to sign in");
        }

        if (data.requires2FA) {
          dispatch({ type: "SET_TWO_FACTOR_REQUIRED" });
          router.push(AUTH_ROUTES.VERIFY_2FA);
          return;
        }

        // Refresh session
        await update();

        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });

        router.push("/dashboard");
      } catch (error) {
        const authError = error as AuthError;
        dispatch({ type: "SET_ERROR", payload: authError.message });
        onError?.(authError);

        toast({
          title: "Error",
          description: authError.message || "An error occurred during sign in",
          variant: "destructive",
        });
      }
    },
    [router, update, onError]
  );

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING" });

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      // Refresh session
      await update();
      dispatch({ type: "CLEAR_USER" });

      router.push(AUTH_ROUTES.SIGN_IN);

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: "SET_ERROR", payload: authError.message });
      onError?.(authError);

      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [router, update, onError]);

  // Session refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING" });
      await update();
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: "SET_ERROR", payload: authError.message });
      onError?.(authError);
    }
  }, [update, onError]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      ...state,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
      refresh: handleRefresh,
      dispatch,
    }),
    [state, handleSignUp, handleSignIn, handleSignOut, handleRefresh]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;