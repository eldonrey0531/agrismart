import { Schema, model, Document, Model, Types } from "mongoose";

// Chat Message Interface
interface IMessage {
  sender: Types.ObjectId;
  conversation: Types.ObjectId;
  content: string;
  attachments?: Array<{
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isDeleted: boolean;
}

// Chat Conversation Interface
interface IConversation {
  participants: Types.ObjectId[];
  type: "direct" | "support";
  lastMessage?: IMessage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Message Document Interface
interface MessageDocument extends Omit<IMessage, "sender" | "readBy">, Document {
  sender: Types.ObjectId;
  readBy: Types.ObjectId[];
  markAsRead(userId: string): Promise<void>;
  softDelete(): Promise<void>;
}

// Message Model Interface
interface MessageModel extends Model<MessageDocument> {
  getUnreadCount(userId: string): Promise<number>;
}

// Conversation Document Interface
interface ConversationDocument extends Omit<IConversation, "participants">, Document {
  participants: Types.ObjectId[];
  addMessage(senderId: string, content: string, attachments?: IMessage["attachments"]): Promise<MessageDocument>;
  markAllAsRead(userId: string): Promise<void>;
  archive(): Promise<void>;
}

// Conversation Model Interface
interface ConversationModel extends Model<ConversationDocument> {
  findOrCreateDirectChat(participant1Id: string, participant2Id: string): Promise<ConversationDocument>;
  getRecentConversations(userId: string, limit?: number): Promise<ConversationDocument[]>;
}

// Message Schema
const messageSchema = new Schema<MessageDocument, MessageModel>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  attachments: [{
    fileId: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
  }],
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Message Methods
messageSchema.methods.markAsRead = async function(userId: string): Promise<void> {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
    await this.save();
  }
};

messageSchema.methods.softDelete = async function(): Promise<void> {
  this.isDeleted = true;
  this.content = "[Message deleted]";
  await this.save();
};

// Message Statics
messageSchema.statics.getUnreadCount = async function(userId: string): Promise<number> {
  return this.countDocuments({
    readBy: { $ne: userId },
    isDeleted: false,
  });
};

// Conversation Schema
const conversationSchema = new Schema<ConversationDocument, ConversationModel>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  type: {
    type: String,
    enum: ["direct", "support"],
    default: "direct",
  },
  lastMessage: messageSchema,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Conversation Methods
conversationSchema.methods.addMessage = async function(
  senderId: string,
  content: string,
  attachments?: IMessage["attachments"]
): Promise<MessageDocument> {
  const message = await Message.create({
    sender: senderId,
    content,
    attachments,
    readBy: [senderId],
  });

  this.lastMessage = message;
  await this.save();

  return message;
};

conversationSchema.methods.markAllAsRead = async function(userId: string): Promise<void> {
  await Message.updateMany(
    {
      conversation: this._id,
      readBy: { $ne: userId }
    },
    {
      $addToSet: { readBy: userId }
    }
  );
};

conversationSchema.methods.archive = async function(): Promise<void> {
  this.isActive = false;
  await this.save();
};

// Conversation Statics
conversationSchema.statics.findOrCreateDirectChat = async function(
  participant1Id: string,
  participant2Id: string
): Promise<ConversationDocument> {
  let conversation = await this.findOne({
    type: "direct",
    participants: { $all: [participant1Id, participant2Id] },
  });

  if (!conversation) {
    conversation = await this.create({
      participants: [participant1Id, participant2Id],
      type: "direct",
    });
  }

  return conversation;
};

conversationSchema.statics.getRecentConversations = async function(
  userId: string,
  limit = 20
): Promise<ConversationDocument[]> {
  return this.find({
    participants: userId,
    isActive: true,
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("participants", "name avatar")
    .populate("lastMessage");
};

// Create models
export const Message = model<MessageDocument, MessageModel>("Message", messageSchema);
export const Conversation = model<ConversationDocument, ConversationModel>("Conversation", conversationSchema);

// Export types and interfaces
export type {
  IMessage,
  IConversation,
  MessageDocument,
  ConversationDocument,
  MessageModel,
  ConversationModel,
};

export default {
  Message,
  Conversation,
};