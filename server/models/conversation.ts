import mongoose from 'mongoose';
import type { IConversation } from '@/types/chat';

const conversationSchema = new mongoose.Schema<IConversation>({
  participants: [{
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  }],
  lastMessage: {
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
conversationSchema.index({ 'participants.id': 1 });
conversationSchema.index({ updatedAt: -1 });

export const ConversationModel = mongoose.models.Conversation || 
  mongoose.model<IConversation>('Conversation', conversationSchema);

export async function findUserConversations(userId: string) {
  return ConversationModel
    .find({ 'participants.id': userId })
    .sort({ updatedAt: -1 })
    .exec();
}

export async function findConversation(conversationId: string) {
  return ConversationModel.findById(conversationId).exec();
}

export async function updateLastMessage(
  conversationId: string,
  content: string,
  senderId: string
) {
  return ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: {
        content,
        timestamp: new Date(),
        senderId,
      },
      updatedAt: new Date(),
    },
    { new: true }
  ).exec();
}

export async function createConversation(
  participants: IConversation['participants'],
  initialMessage?: { content: string; senderId: string }
) {
  const conversation = new ConversationModel({
    participants,
    lastMessage: initialMessage ? {
      content: initialMessage.content,
      timestamp: new Date(),
      senderId: initialMessage.senderId,
    } : undefined,
  });

  return conversation.save();
}