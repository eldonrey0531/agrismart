import { Router } from "express";
import {
  getMarketplaceAnalytics,
  getChatAnalytics,
  getUserAnalytics,
  getSearchAnalytics,
  getEvents,
  getAggregates,
} from "../controllers/analytics";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply admin-only middleware to all analytics routes
router.use(authenticate, authorize("admin"));

// Apply rate limiting to prevent abuse
const analyticsRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  30, // 30 requests per minute
  "Too many analytics requests"
);

// Date range validation schema
const dateRangeSchema = {
  query: {
    start: {
      type: "string" as const,
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    },
    end: {
      type: "string" as const,
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    },
  },
};

// Analytics routes
router.get(
  "/marketplace",
  analyticsRateLimit,
  validateRequest(dateRangeSchema),
  getMarketplaceAnalytics
);

router.get(
  "/chat",
  analyticsRateLimit,
  validateRequest(dateRangeSchema),
  getChatAnalytics
);

router.get(
  "/users",
  analyticsRateLimit,
  validateRequest(dateRangeSchema),
  getUserAnalytics
);

router.get(
  "/search",
  analyticsRateLimit,
  validateRequest(dateRangeSchema),
  getSearchAnalytics
);

// Raw events with type filter
router.get(
  "/events",
  analyticsRateLimit,
  validateRequest({
    query: {
      ...dateRangeSchema.query,
      type: {
        type: "string" as const,
        required: true,
        enum: [
          "user_registration",
          "seller_verification",
          "product_creation",
          "product_view",
          "order_creation",
          "order_status_change",
          "chat_message",
          "user_login",
          "search_query",
        ],
      },
    },
  }),
  getEvents
);

// Aggregated data with optional type filter
router.get(
  "/aggregates",
  analyticsRateLimit,
  validateRequest({
    query: {
      ...dateRangeSchema.query,
      types: {
        type: "string" as const,
        required: false,
        pattern: /^[a-z_]+(,[a-z_]+)*$/,
      },
    },
  }),
  getAggregates
);

export default router;