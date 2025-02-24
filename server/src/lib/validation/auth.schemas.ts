import { z } from 'zod';
import { stringValidations } from './common.schemas';

export const authValidation = {
  register: z.object({
    email: stringValidations.email,
    password: stringValidations.password,
    name: stringValidations.name,
    confirmPassword: stringValidations.password,
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' })
    })
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    }
  ),

  login: z.object({
    email: stringValidations.email,
    password: z.string(),
    rememberMe: z.boolean().optional()
  }),

  forgotPassword: z.object({
    email: stringValidations.email
  }),

  resetPassword: z.object({
    token: z.string(),
    password: stringValidations.password,
    confirmPassword: stringValidations.password
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    }
  ),

  verifyEmail: z.object({
    token: z.string()
  }),

  refreshToken: z.object({
    refreshToken: z.string()
  }),

  socialAuth: z.object({
    provider: z.enum(['google', 'facebook', 'apple']),
    token: z.string(),
    data: z.record(z.any()).optional()
  }),

  mfa: {
    setup: z.object({
      phone: stringValidations.phone
    }),

    verify: z.object({
      code: z.string().length(6).regex(/^\d+$/, 'Must be a 6-digit number')
    }),

    disable: z.object({
      password: stringValidations.password
    })
  },

  session: z.object({
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    deviceType: z.enum(['web', 'mobile', 'tablet', 'desktop']).optional(),
    ipAddress: z.string().ip().optional(),
    location: z.string().optional()
  }),

  logout: z.object({
    all: z.boolean().optional(),
    sessionId: z.string().optional()
  }).refine(
    (data) => !(!data.all && !data.sessionId),
    {
      message: "Either 'all' or 'sessionId' must be provided",
      path: ["sessionId"]
    }
  )
};

// Export type utilities
export type RegisterInput = z.infer<typeof authValidation.register>;
export type LoginInput = z.infer<typeof authValidation.login>;
export type ForgotPasswordInput = z.infer<typeof authValidation.forgotPassword>;
export type ResetPasswordInput = z.infer<typeof authValidation.resetPassword>;
export type SocialAuthInput = z.infer<typeof authValidation.socialAuth>;
export type MFASetupInput = z.infer<typeof authValidation.mfa.setup>;
export type MFAVerifyInput = z.infer<typeof authValidation.mfa.verify>;
export type SessionInput = z.infer<typeof authValidation.session>;
export type LogoutInput = z.infer<typeof authValidation.logout>;

// Validation middleware factory
export const validate = {
  register: authValidation.register,
  login: authValidation.login,
  forgotPassword: authValidation.forgotPassword,
  resetPassword: authValidation.resetPassword,
  verifyEmail: authValidation.verifyEmail,
  refreshToken: authValidation.refreshToken,
  socialAuth: authValidation.socialAuth,
  mfa: authValidation.mfa,
  session: authValidation.session,
  logout: authValidation.logout
} as const;