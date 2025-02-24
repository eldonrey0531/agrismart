import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { asyncHandler } from "../middleware";
import { AppError, NotFoundError } from "../utils/app-error";
import { analyticsService } from "../services/AnalyticsService";
import { notificationService } from "../services/NotificationService";

// Get list of users with filtering and pagination
export const getUsers = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const {
    page = "1",
    limit = "20",
    role,
    status,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query: any = {};
  
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ [sortBy as string]: order === "desc" ? -1 : 1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string)),
    User.countDocuments(query),
  ]);

  return res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// Get user details with activity history
export const getUserDetails = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Get user's recent activity
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  const [activity, analytics] = await Promise.all([
    analyticsService.getEvents("user_login", startDate, endDate),
    analyticsService.getUserAnalytics(startDate, endDate),
  ]);

  return res.json({
    success: true,
    data: {
      user,
      activity,
      analytics,
    },
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent role escalation to admin
  if (role === "admin" && !req.user!.hasRole("admin")) {
    throw new AppError("Not authorized to assign admin role", 403);
  }

  user.role = role;
  await user.save();

  // Log the change
  await analyticsService.logEvent(
    "user_role_update",
    {
      targetUserId: userId,
      oldRole: user.role,
      newRole: role,
      updatedBy: req.user!.id,
    },
    req.user!.id,
    req
  );

  // Notify the user
  await notificationService.broadcastEvent({
    type: "user_role_update",
    payload: {
      oldRole: user.role,
      newRole: role,
    },
    userId: userId,
    metadata: {
      updatedBy: req.user!.id,
      timestamp: new Date(),
    },
  });

  return res.json({
    success: true,
    data: user,
  });
});

// Update user status (active/suspended)
export const updateUserStatus = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent status change for admins
  if (user.hasRole("admin") && !req.user!.hasRole("admin")) {
    throw new AppError("Not authorized to modify admin status", 403);
  }

  user.status = status;
  user.statusReason = reason;
  user.statusUpdatedAt = new Date();
  user.statusUpdatedBy = req.user!.id;

  await user.save();

  // Log the change
  await analyticsService.logEvent(
    "user_status_update",
    {
      targetUserId: userId,
      oldStatus: user.status,
      newStatus: status,
      reason,
      updatedBy: req.user!.id,
    },
    req.user!.id,
    req
  );

  // Notify the user
  await notificationService.broadcastEvent({
    type: "user_status_update",
    payload: {
      status,
      reason,
      oldStatus: user.status,
    },
    userId: userId,
    metadata: {
      updatedBy: req.user!.id,
      timestamp: new Date(),
    },
  });

  return res.json({
    success: true,
    data: user,
  });
});

// Delete user (soft delete)
export const deleteUser = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent deletion of admins
  if (user.hasRole("admin")) {
    throw new AppError("Cannot delete admin users", 403);
  }

  user.deletedAt = new Date();
  user.deletedBy = req.user!.id;
  user.deletionReason = reason;
  await user.save();

  // Log the deletion
  await analyticsService.logEvent(
    "user_deletion",
    {
      targetUserId: userId,
      reason,
      deletedBy: req.user!.id,
    },
    req.user!.id,
    req
  );

  // Notify the user about account deletion
  await notificationService.broadcastEvent({
    type: "account_alert",
    payload: {
      message: "Your account has been deleted",
      reason,
    },
    userId: userId,
    metadata: {
      deletedBy: req.user!.id,
      timestamp: new Date(),
    },
  });

  return res.json({
    success: true,
    message: "User successfully deleted",
  });
});

export default {
  getUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};