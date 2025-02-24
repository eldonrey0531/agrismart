import express from 'express';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { AuthController } from '../controllers/auth.controller';
import { loginSchema, registerSchema, changePasswordSchema } from '../validations/auth.schema';
import { rateLimit } from '../middleware/rate-limit';

const router = express.Router();

// Rate limiting configurations
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many registration attempts, please try again later'
});

// Public routes
router.post('/register', registerLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), AuthController.login);
router.post('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', AuthController.resetPassword);

// Protected routes (require authentication)
router.use(authenticate);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/change-password', validateBody(changePasswordSchema), AuthController.changePassword);
router.get('/me', AuthController.getProfile);
router.post('/revoke-all-tokens', AuthController.revokeAllTokens);

export { router as authRouter };