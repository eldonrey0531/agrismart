import mongoose from 'mongoose';
import type { IMessage, MessageStatus } from '@/types/chat';

const messageSchema = new mongoose.Schema<IMessage>({
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'error'],
    default: 'sent',
  },
});

// Create compound index for efficient querying
messageSchema.index({ conversationId: 1, timestamp: -1 });

export const MessageModel = mongoose.models.Message ||
  mongoose.model<IMessage>('Message', messageSchema);

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<IMessage> {
  const message = new MessageModel({
    conversationId,
    senderId,
    content,
    timestamp: new Date(),
    status: 'sent',
  });

  return message.save();
}

export async function getConversationMessages(
  conversationId: string,
  limit = 50,
  before?: Date
) {
  const query = {
    conversationId,
    ...(before && { timestamp: { $lt: before } }),
  };

  return MessageModel
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
) {
  return MessageModel.findByIdAndUpdate(
    messageId,
    { status },
    { new: true }
  ).exec();
}

export async function deleteMessage(messageId: string) {
  return MessageModel.findByIdAndDelete(messageId).exec();
}