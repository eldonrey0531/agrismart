import { Router } from "express";
import multer from "multer";
import {
  getConversations,
  getDirectConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  archiveConversation,
} from "../controllers/chat";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for chat attachments
  },
});

// Chat rate limiters
const messageRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  30, // 30 messages per minute
  "Too many messages sent"
);

const attachmentRateLimit = createRateLimiter(
  60 * 1000, // 1 minute window
  5, // 5 attachments per minute
  "Too many attachments sent"
);

// Get user's conversations
router.get(
  "/conversations",
  authenticate,
  validateRequest({
    query: {
      limit: {
        type: "number",
        required: false,
        min: 1,
        max: 50,
      },
      page: {
        type: "number",
        required: false,
        min: 1,
      },
    },
  }),
  getConversations
);

// Get or create direct chat
router.get(
  "/conversations/direct/:userId",
  authenticate,
  validateRequest({
    params: {
      userId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  getDirectConversation
);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  authenticate,
  validateRequest({
    params: {
      conversationId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    query: {
      limit: {
        type: "number",
        required: false,
        min: 1,
        max: 50,
      },
      before: {
        type: "string",
        required: false,
        pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      },
    },
  }),
  getMessages
);

// Send message to conversation
router.post(
  "/conversations/:conversationId/messages",
  authenticate,
  upload.array("attachments", 5), // Max 5 attachments per message
  messageRateLimit,
  validateRequest({
    params: {
      conversationId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
    body: {
      content: {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 5000,
      },
    },
  }),
  sendMessage
);

// Delete a message
router.delete(
  "/messages/:messageId",
  authenticate,
  validateRequest({
    params: {
      messageId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  deleteMessage
);

// Archive a conversation
router.post(
  "/conversations/:conversationId/archive",
  authenticate,
  validateRequest({
    params: {
      conversationId: {
        type: "string",
        required: true,
        pattern: /^[0-9a-fA-F]{24}$/,
      },
    },
  }),
  archiveConversation
);

export default router;
