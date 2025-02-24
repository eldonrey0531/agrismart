import { Router } from 'express';
import { AuthController } from '../../controllers/auth';

const router = Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Password management
router.post('/reset-password', AuthController.resetPassword);
router.post('/password/change', AuthController.changePassword);
router.get('/password/status', AuthController.getPasswordStatus);

// Session management
router.get('/session', AuthController.getSession);
router.get('/sessions', AuthController.getAllSessions);
router.delete('/sessions/:id', AuthController.revokeSession);

// 2FA
router.post('/2fa/enable', AuthController.enable2FA);
router.post('/2fa/verify', AuthController.verify2FA);
router.post('/2fa/disable', AuthController.disable2FA);

// Security
router.get('/login-history', AuthController.getLoginHistory);
router.get('/security/events', AuthController.getSecurityEvents);

export default router;