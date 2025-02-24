import { Router } from 'express';
import { 
  login, 
  register, 
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  changeEmail,
  logout,
  getCurrentUser,
} from '../controllers/auth';
import { validateBody } from '../middleware/validateRequest';
import { isAuthenticated, requireVerified } from '../middleware/isAuthenticated';
import { authRateLimiter, emailRateLimiter } from '../middleware/rateLimiter';
import {
  loginSchema,
  registrationSchema,
  verifyEmailSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordChangeSchema,
  emailChangeSchema,
} from '../validations/auth';
import { RequestHandler } from '../types/express';
import { AuthUser } from '../types/user';

const router = Router();

/**
 * Route handler types
 */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyEmailRequest {
  token: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

interface EmailChangeRequest {
  email: string;
  password: string;
}

// Type safe route handlers
const typedHandlers = {
  login: login as RequestHandler<{}, AuthResponse, LoginRequest>,
  register: register as RequestHandler<{}, AuthResponse, typeof registrationSchema._type>,
  verifyEmail: verifyEmail as RequestHandler<{}, { user: AuthUser }, VerifyEmailRequest>,
  getCurrentUser: getCurrentUser as RequestHandler<{}, { user: AuthUser }>,
  resetPassword: resetPassword as RequestHandler<{}, AuthResponse, typeof passwordResetSchema._type>,
  changePassword: changePassword as RequestHandler<{}, void, PasswordChangeRequest>,
  changeEmail: changeEmail as RequestHandler<{}, void, EmailChangeRequest>,
};

// Public routes with rate limiting
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  typedHandlers.login
);

router.post(
  '/register',
  authRateLimiter,
  validateBody(registrationSchema),
  typedHandlers.register
);

router.post(
  '/verify-email',
  emailRateLimiter,
  validateBody(verifyEmailSchema),
  typedHandlers.verifyEmail
);

router.post(
  '/resend-verification',
  isAuthenticated,
  emailRateLimiter,
  resendVerificationEmail
);

router.post(
  '/reset-password/request',
  emailRateLimiter,
  validateBody(passwordResetRequestSchema),
  requestPasswordReset
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(passwordResetSchema),
  typedHandlers.resetPassword
);

// Protected routes requiring verification
router.use(isAuthenticated);

router.get('/me', typedHandlers.getCurrentUser);

router.put(
  '/password',
  requireVerified,
  authRateLimiter,
  validateBody(passwordChangeSchema),
  typedHandlers.changePassword
);

router.put(
  '/email',
  requireVerified,
  emailRateLimiter,
  validateBody(emailChangeSchema),
  typedHandlers.changeEmail
);

router.post('/logout', logout);

export default router;
