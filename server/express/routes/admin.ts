import { Router } from "express";
import {
  getUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/admin";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { createRateLimiter } from "../middleware/rateLimiter";
import { Role, AccountStatus } from "../models/types/user";

const router = Router();

// Apply admin-only middleware to all routes
router.use(authenticate, authorize("admin"));

// Apply rate limiting to prevent abuse
const adminRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  30, // 30 requests per minute
  "Too many admin requests"
);

// List users with filtering and pagination
router.get(
  "/users",
  adminRateLimit,
  validateRequest({
    query: {
      page: {
        type: "number",
        required: false,
        min: 1,
      },
      limit: {
        type: "number",
        required: false,
        min: 1,
        max: 100,
      },
      role: {
        type: "string",
        required: false,
        enum: ["user", "seller", "admin"],
      },
      status: {
        type: "string",
        required: false,
        enum: ["active", "suspended", "pending"],
      },
      search: {
        type: "string",
        required: false,
        minLength: 2,
      },
      sortBy: {
        type: "string",
        required: false,
        enum: ["createdAt", "name", "email", "role", "status"],
      },
      order: {
        type: "string",
        required: false,
        enum: ["asc", "desc"],
      },
    },
  }),
  getUsers
);

// Get user details with activity history
router.get(
  "/users/:userId",
  adminRateLimit,
  validateRequest({
    params: {
      userId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  getUserDetails
);

// Update user role
router.put(
  "/users/:userId/role",
  adminRateLimit,
  validateRequest({
    params: {
      userId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    body: {
      role: {
        type: "string",
        required: true,
        enum: ["user", "seller", "admin"],
      },
    },
  }),
  updateUserRole
);

// Update user status
router.put(
  "/users/:userId/status",
  adminRateLimit,
  validateRequest({
    params: {
      userId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    body: {
      status: {
        type: "string",
        required: true,
        enum: ["active", "suspended", "pending"],
      },
      reason: {
        type: "string",
        required: true,
        minLength: 10,
        maxLength: 500,
      },
    },
  }),
  updateUserStatus
);

// Delete user
router.delete(
  "/users/:userId",
  adminRateLimit,
  validateRequest({
    params: {
      userId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    body: {
      reason: {
        type: "string",
        required: true,
        minLength: 10,
        maxLength: 500,
      },
    },
  }),
  deleteUser
);

export default router;