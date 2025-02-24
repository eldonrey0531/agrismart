import mongoose, { Document, Schema, Types } from "mongoose";
import type { AuthUser } from "../types/role";

// Interfaces
export interface IAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface IMessage extends Document {
  sender: Types.ObjectId | AuthUser;
  conversation: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  attachments?: IAttachment[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participants: (Types.ObjectId | AuthUser)[];
  type: "direct" | "group";
  lastMessage?: Types.ObjectId | IMessage;
  unreadCounts: Map<string, number>;
  metadata?: {
    groupName?: string;
    groupAvatar?: string;
    isArchived?: boolean;
    pinnedMessages?: Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const attachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
});

const messageSchema = new Schema<IMessage>(
  {
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
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    attachments: [attachmentSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    metadata: {
      groupName: String,
      groupAvatar: String,
      isArchived: Boolean,
      pinnedMessages: [{
        type: Schema.Types.ObjectId,
        ref: "Message",
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ "metadata.isArchived": 1 });

// Ensure participants are unique in a conversation
conversationSchema.pre("save", function(next) {
  this.participants = Array.from(new Set(this.participants));
  next();
});

// Models
export const Message = mongoose.model<IMessage>("Message", messageSchema);
export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);