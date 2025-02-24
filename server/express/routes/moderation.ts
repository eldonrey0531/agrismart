import { Router } from "express";
import {
  reportContent,
  filterContent,
  getPendingReports,
  getContentReports,
  assignReport,
  resolveReport,
  rejectReport,
  createFilterRule,
  toggleFilterRule,
  getActiveFilterRules,
} from "../controllers/moderation";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Rate limiters
const reportRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  10, // 10 reports per minute
  "Too many reports submitted"
);

const moderationRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  30, // 30 moderation actions per minute
  "Too many moderation actions"
);

// Public routes (require authentication only)
router.post(
  "/report",
  authenticate,
  reportRateLimit,
  validateRequest({
    body: {
      contentType: {
        type: "string",
        required: true,
        enum: ["product", "user", "chat", "review"],
      },
      contentId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
      reason: {
        type: "string",
        required: true,
        enum: ["inappropriate", "spam", "fake", "offensive", "illegal", "other"],
      },
      description: {
        type: "string",
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
      metadata: {
        type: "object",
        required: false,
      },
    },
  }),
  reportContent
);

router.post(
  "/filter",
  authenticate,
  moderationRateLimit,
  validateRequest({
    body: {
      content: {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 5000,
      },
    },
  }),
  filterContent
);

// Admin-only routes
router.use(authenticate, authorize("admin"));

// Reports management
router.get(
  "/reports/pending",
  moderationRateLimit,
  getPendingReports
);

router.get(
  "/reports/:contentType/:contentId",
  moderationRateLimit,
  validateRequest({
    params: {
      contentType: {
        type: "string",
        required: true,
        enum: ["product", "user", "chat", "review"],
      },
      contentId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  getContentReports
);

router.post(
  "/reports/:reportId/assign",
  moderationRateLimit,
  validateRequest({
    params: {
      reportId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  assignReport
);

router.post(
  "/reports/:reportId/resolve",
  moderationRateLimit,
  validateRequest({
    params: {
      reportId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    body: {
      resolution: {
        type: "string",
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
      action: {
        type: "string",
        required: false,
        enum: ["warn", "restrict", "suspend", "delete"],
      },
    },
  }),
  resolveReport
);

router.post(
  "/reports/:reportId/reject",
  moderationRateLimit,
  validateRequest({
    params: {
      reportId: {
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
        maxLength: 1000,
      },
    },
  }),
  rejectReport
);

// Filter rules management
router.post(
  "/rules",
  moderationRateLimit,
  validateRequest({
    body: {
      type: {
        type: "string",
        required: true,
        enum: ["keyword", "pattern", "image"],
      },
      pattern: {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 500,
      },
      action: {
        type: "string",
        required: true,
        enum: ["flag", "block", "delete"],
      },
      severity: {
        type: "string",
        required: true,
        enum: ["low", "medium", "high"],
      },
      metadata: {
        type: "object",
        required: false,
      },
    },
  }),
  createFilterRule
);

router.post(
  "/rules/:ruleId/toggle",
  moderationRateLimit,
  validateRequest({
    params: {
      ruleId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  toggleFilterRule
);

router.get(
  "/rules/active",
  moderationRateLimit,
  getActiveFilterRules
);

export default router;