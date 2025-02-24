import { Request, Response, NextFunction } from "express";
import { Conversation, Message } from "../models/Chat";
import { User } from "../models";
import { AppError, NotFoundError } from "../utils/app-error";
import { asyncHandler } from "../middleware";
import { uploadFile } from "../utils/storage";
import { chatService } from "../services/ChatService";

// Get all conversations for the current user
export const getConversations = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { limit = "20", page = "1" } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [conversations, total] = await Promise.all([
    Conversation.find({ participants: req.user!.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate("participants", "name avatar")
      .populate("lastMessage"),
    Conversation.countDocuments({ participants: req.user!.id }),
  ]);

  return res.json({
    success: true,
    data: conversations,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// Get or create a direct conversation with another user
export const getDirectConversation = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { userId } = req.params;

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  // Find or create conversation
  const conversation = await Conversation.findOrCreateDirectChat(
    req.user!.id,
    userId
  );

  await conversation.populate("participants", "name avatar");
  await conversation.populate("lastMessage");

  return res.json({
    success: true,
    data: conversation,
  });
});

// Get messages for a conversation
export const getMessages = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { conversationId } = req.params;
  const { limit = "50", before } = req.query;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // Verify user is a participant
  if (!conversation.participants.map(p => p.toString()).includes(req.user!.id)) {
    throw new AppError("Not authorized to access this conversation", 403);
  }

  // Build query
  const query: any = { conversation: conversationId };
  if (before) {
    query.createdAt = { $lt: new Date(before as string) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string))
    .populate("sender", "name avatar");

  // Mark messages as read
  await conversation.markAllAsRead(req.user!.id);

  return res.json({
    success: true,
    data: messages.reverse(),
  });
});

// Send a message (fallback for non-WebSocket clients)
export const sendMessage = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // Verify user is a participant
  if (!conversation.participants.map(p => p.toString()).includes(req.user!.id)) {
    throw new AppError("Not authorized to send messages in this conversation", 403);
  }

  // Handle attachments if any
  let attachments;
  if (req.files && Array.isArray(req.files)) {
    attachments = await Promise.all(
      req.files.map(async file => {
        const fileId = await uploadFile(file.buffer, file.originalname, file.mimetype);
        return {
          fileId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        };
      })
    );
  }

  // Create message
  const message = await conversation.addMessage(req.user!.id, content, attachments);
  await message.populate("sender", "name avatar");

  // Send message to WebSocket clients
  chatService.sendMessageToConversation(
    conversationId,
    message,
    req.user!.id
  );

  return res.json({
    success: true,
    data: message,
  });
});

// Delete a message
export const deleteMessage = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId).populate("conversation");
  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // Verify user is the sender
  if (message.sender.toString() !== req.user!.id) {
    throw new AppError("Not authorized to delete this message", 403);
  }

  await message.softDelete();

  // Broadcast deletion to WebSocket clients
  chatService.broadcastMessageDeletion(
    messageId,
    message.conversation._id.toString(),
    req.user!.id
  );

  return res.json({
    success: true,
    message: "Message deleted successfully",
  });
});

// Archive a conversation
export const archiveConversation = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // Verify user is a participant
  if (!conversation.participants.map(p => p.toString()).includes(req.user!.id)) {
    throw new AppError("Not authorized to archive this conversation", 403);
  }

  await conversation.archive();

  // Broadcast archive status
  chatService.broadcastEvent({
    type: "conversation.archive",
    payload: { conversation: conversation.toJSON() },
    conversationId,
    senderId: req.user!.id,
  });

  return res.json({
    success: true,
    message: "Conversation archived successfully",
  });
});

export default {
  getConversations,
  getDirectConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  archiveConversation,
};
