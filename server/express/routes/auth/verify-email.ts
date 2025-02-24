import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { EmailVerificationService } from '../../services/EmailVerificationService';
import { auth } from '../../middleware/auth';
import { BadRequestError } from '../../utils/app-error';
import { VerificationResponse } from '../../types/auth';
import { AuthRouteHandler, RouteHandler } from '../../types/express';

const router = Router();

// Resend verification email
const resendHandler: AuthRouteHandler<VerificationResponse> = async (req, res, next) => {
  try {
    const { id: userId, email, name } = req.user;

    if (!email) {
      throw new BadRequestError('No email address found');
    }

    // Get verification status
    const status = await EmailVerificationService.getVerificationStatus(userId);
    
    if (!status.canResend) {
      const response: VerificationResponse = {
        success: false,
        message: `Please wait ${status.cooldownSeconds} seconds before requesting another email`,
        status
      };
      return res.status(429).json(response);
    }

    // Send verification email
    await EmailVerificationService.sendVerification(userId, email, name || email);

    // Get updated status
    const updatedStatus = await EmailVerificationService.getVerificationStatus(userId);

    const response: VerificationResponse = {
      success: true,
      message: 'Verification email sent',
      status: updatedStatus
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Verify email token
const verifyHandler: RouteHandler<{ success: boolean; message: string }> = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new BadRequestError('Verification token is required');
    }

    await EmailVerificationService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get verification status
const getStatusHandler: AuthRouteHandler<VerificationResponse> = async (req, res, next) => {
  try {
    const status = await EmailVerificationService.getVerificationStatus(req.user.id);
    
    const response: VerificationResponse = {
      success: true,
      status
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

router.post('/resend', auth, resendHandler);
router.post('/verify', verifyHandler);
router.get('/status', auth, getStatusHandler);

export { router as verifyEmailRouter };