import { Response } from "express";
import { Message, Conversation, IMessage, IConversation } from "../models/Chat";
import { Socket as AppSocket } from "../types/socket";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { uploadToStorage } from "../services/storage";
import {
  GetConversationsRequest,
  GetMessagesRequest,
  CreateConversationRequest,
  MessageData,
  SocketMessageData,
  MessageAttachment
} from "../types/chat";
import { Types } from "mongoose";

export class ChatController {
  // WebSocket event handlers
  static async handleSocketMessage(socket: AppSocket, data: SocketMessageData) {
    try {
      const user = socket.data.user;
      
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) {
        throw ApiError.notFound("Conversation not found");
      }

      if (!conversation.participants.some(p => p.toString() === user.id)) {
        throw ApiError.forbidden("Not a participant in this conversation");
      }

      const messageData: Partial<IMessage> = {
        sender: new Types.ObjectId(user.id),
        conversation: new Types.ObjectId(data.conversationId),
        content: data.content,
        readBy: [new Types.ObjectId(user.id)],
      };

      if (data.attachments?.length) {
        messageData.attachments = await Promise.all(
          data.attachments.map(async (file): Promise<MessageAttachment> => {
            const url = await uploadToStorage(file);
            return {
              url,
              type: file.mimetype,
              name: file.originalname,
              size: file.size,
            };
          })
        );
      }

      const message = await Message.create(messageData);
      await message.populate("sender", "name avatar");

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(
        conversation._id,
        { lastMessage: message._id },
        { new: true }
      );

      // Emit message to all participants
      socket.to(data.conversationId).emit("message", message.toJSON());
      
      return message;
    } catch (error) {
      console.error("Error handling message:", error);
      throw error;
    }
  }

  // HTTP endpoints
  static getConversations = asyncHandler(async (
    req: GetConversationsRequest,
    res: Response
  ) => {
    const userId = new Types.ObjectId(req.user.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IConversation[]>();

    const total = await Conversation.countDocuments({ participants: userId });

    res.json({
      success: true,
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static getMessages = asyncHandler(async (
    req: GetMessagesRequest,
    res: Response
  ) => {
    const { conversationId } = req.params;
    const userId = new Types.ObjectId(req.user.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound("Conversation not found");
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      throw ApiError.forbidden("Not authorized to view these messages");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IMessage[]>();

    const total = await Message.countDocuments({ conversation: conversationId });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static createConversation = asyncHandler(async (
    req: CreateConversationRequest,
    res: Response
  ) => {
    const { participants, type = "direct", message } = req.body;
    const userId = new Types.ObjectId(req.user.id);

    // Ensure unique participants including the creator
    const uniqueParticipants = Array.from(new Set([
      userId.toString(),
      ...participants.map((id: string) => new Types.ObjectId(id).toString())
    ])).map(id => new Types.ObjectId(id));

    if (type === "direct" && uniqueParticipants.length !== 2) {
      throw ApiError.badRequest("Direct conversations must have exactly 2 participants");
    }

    // Check if direct conversation already exists
    if (type === "direct") {
      const existingConversation = await Conversation.findOne({
        type: "direct",
        participants: { $all: uniqueParticipants },
      })
        .populate("participants", "name email avatar")
        .populate("lastMessage")
        .lean<IConversation>();

      if (existingConversation) {
        return res.json({
          success: true,
          conversation: existingConversation,
        });
      }
    }

    const conversation = await Conversation.create({
      participants: uniqueParticipants,
      type,
    });

    if (message) {
      const newMessage = await Message.create({
        sender: userId,
        conversation: conversation._id,
        content: message,
        readBy: [userId],
      });

      await Conversation.findByIdAndUpdate(
        conversation._id,
        { lastMessage: newMessage._id },
        { new: true }
      );
    }

    await conversation.populate("participants", "name email avatar");
    await conversation.populate("lastMessage");

    res.status(201).json({
      success: true,
      conversation: conversation.toJSON(),
    });
  });
}

export default ChatController;