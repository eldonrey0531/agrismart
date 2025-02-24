import { type ReactNode } from 'react'

export interface ToastMessage {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  action?: ReactNode
}

// Success messages
export const successToasts = {
  emailVerified: {
    title: "Email Verified",
    description: "Your email has been successfully verified.",
    variant: "success",
  },
  passwordReset: {
    title: "Password Reset",
    description: "Your password has been successfully reset.",
    variant: "success",
  },
  twoFactorEnabled: {
    title: "2FA Enabled",
    description: "Two-factor authentication has been enabled for your account.",
    variant: "success",
  },
  profileUpdated: {
    title: "Profile Updated",
    description: "Your profile has been successfully updated.",
    variant: "success",
  },
  verificationEmailSent: {
    title: "Email Sent",
    description: "A verification email has been sent to your inbox.",
    variant: "success",
  }
} as const satisfies Record<string, ToastMessage>

// Error messages
export const errorToasts = {
  verificationFailed: {
    title: "Verification Failed",
    description: "Unable to verify your email. Please try again.",
    variant: "destructive",
  },
  invalidToken: {
    title: "Invalid Token",
    description: "The verification token is invalid or has expired.",
    variant: "destructive",
  },
  rateLimitExceeded: {
    title: "Too Many Attempts",
    description: "Please wait before trying again.",
    variant: "destructive",
  },
  serverError: {
    title: "Server Error",
    description: "An unexpected error occurred. Please try again later.",
    variant: "destructive",
  },
  unauthorized: {
    title: "Unauthorized",
    description: "You must be logged in to perform this action.",
    variant: "destructive",
  },
  invalidCredentials: {
    title: "Invalid Credentials",
    description: "The provided credentials are incorrect.",
    variant: "destructive",
  }
} as const satisfies Record<string, ToastMessage>

// Info messages
export const infoToasts = {
  sessionExpired: {
    title: "Session Expired",
    description: "Please sign in again to continue.",
    variant: "default",
  },
  verificationRequired: {
    title: "Verification Required",
    description: "Please verify your email to continue.",
    variant: "default",
  },
  twoFactorRequired: {
    title: "2FA Required",
    description: "Please complete two-factor authentication.",
    variant: "default",
  },
  maintenance: {
    title: "Maintenance",
    description: "System maintenance in progress. Please try again later.",
    variant: "default",
  }
} as const satisfies Record<string, ToastMessage>

// Create custom toast with dynamic content
export function createCustomToast(
  base: ToastMessage,
  dynamicContent: Partial<ToastMessage>
): ToastMessage {
  return {
    ...base,
    ...dynamicContent,
    // Allow overriding only description by default
    title: base.title,
    variant: base.variant
  }
}

// Toast with action example
export function createActionToast(
  message: string,
  action: ReactNode
): ToastMessage {
  return {
    title: "Action Required",
    description: message,
    variant: "default",
    action,
  }
}

// Helper to create error toast from Error object
export function createErrorToast(error: Error): ToastMessage {
  return {
    title: "Error",
    description: error.message || "An unexpected error occurred",
    variant: "destructive",
  }
}

// Helper to create a custom error toast
export function createCustomErrorToast(
  title: string,
  error: Error | string
): ToastMessage {
  return {
    title,
    description: error instanceof Error ? error.message : error,
    variant: "destructive",
  }
}

// Helper to create a custom success toast
export function createSuccessToast(
  title: string,
  message: string
): ToastMessage {
  return {
    title,
    description: message,
    variant: "success",
  }
}

// Helper to create an info toast
export function createInfoToast(
  title: string,
  message: string
): ToastMessage {
  return {
    title,
    description: message,
    variant: "default",
  }
}