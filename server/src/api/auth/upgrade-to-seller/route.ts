import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { SellerUpgradeResponse } from '@/types/auth';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import { ApiException } from '@/lib/utils/error-handler';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    // Get token from authorization header
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    const userId = decoded.user.id;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiException(ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED, 401);
    }

    // Validate eligibility
    if (user.role !== 'user') {
      throw new ApiException('Only users can request seller upgrade', 400);
    }

    if (user.accountLevel === 'seller') {
      throw new ApiException('User is already a seller', 400);
    }

    if (user.status !== 'approved') {
      throw new ApiException('Account must be approved to request seller upgrade', 400);
    }

    // Update user account level and set status to pending
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountLevel: 'seller',
        status: 'pending', // Reset status to pending for seller approval
        statusReason: 'Awaiting seller verification',
        statusUpdatedAt: new Date()
      }
    });

    // Prepare response
    const response: SellerUpgradeResponse = {
      success: true,
      message: SUCCESS_MESSAGES.AUTH.SELLER_REQUEST_SUBMITTED,
      newAccountLevel: updatedUser.accountLevel as 'seller'
    };

    // TODO: Notify admins of new seller request
    // await notifyAdmins({
    //   type: 'SELLER_REQUEST',
    //   userId: user.id,
    //   userName: user.name
    // });

    return ApiResponse.success(
      response,
      SUCCESS_MESSAGES.AUTH.SELLER_REQUEST_SUBMITTED,
      200
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    
    console.error('Seller upgrade error:', error);
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Handle admin approval/rejection of seller requests
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return ApiResponse.unauthorized();
    }

    // Verify token and check admin role
    const decoded = verifyToken(token);
    if (decoded.user.role !== 'admin') {
      return ApiResponse.forbidden();
    }

    const { userId, approved, reason } = await req.json();

    if (!userId) {
      throw new ApiException('User ID is required', 400);
    }

    // Update user status based on admin decision
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: approved ? 'approved' : 'rejected',
        statusReason: reason || (approved ? 'Seller approval granted' : 'Seller request rejected'),
        statusUpdatedAt: new Date(),
        statusUpdatedBy: decoded.user.id
      }
    });

    // TODO: Send notification to user about the decision
    // await notifyUser(userId, {
    //   type: approved ? 'SELLER_APPROVED' : 'SELLER_REJECTED',
    //   reason
    // });

    const message = approved
      ? SUCCESS_MESSAGES.AUTH.SELLER_APPROVED
      : 'Seller request rejected';

    return ApiResponse.success(
      { user: updatedUser },
      message,
      200
    );

  } catch (error) {
    if (error instanceof ApiException) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    
    console.error('Seller approval error:', error);
    return ApiResponse.error(ERROR_MESSAGES.SERVER);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return ApiResponse.cors();
}