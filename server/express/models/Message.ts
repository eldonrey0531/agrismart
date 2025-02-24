import { Schema, model, Document, Types, Model } from "mongoose";
import { UserDocument } from "./User";
import { ConversationDocument } from "./Conversation";
import { MessageStatus, MessageType } from "./types";

interface IMessage {
  conversation: Types.ObjectId | ConversationDocument;
  sender: Types.ObjectId | UserDocument;
  content: string;
  type: MessageType;
  status: MessageStatus;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  replyTo?: Types.ObjectId | MessageDocument;
  editHistory?: {
    content: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Message Document (instance methods)
export interface MessageDocument extends Omit<IMessage, 'id'>, Document {
  markAsDelivered(): Promise<void>;
  markAsRead(): Promise<void>;
  edit(newContent: string): Promise<void>;
}

// Interface for Message Model (static methods)
export interface MessageModel extends Model<MessageDocument> {
  findByConversation(
    conversationId: Types.ObjectId,
    options?: {
      limit?: number;
      before?: Date;
      after?: Date;
    }
  ): Promise<MessageDocument[]>;
}

const messageSchema = new Schema<MessageDocument, MessageModel>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "image", "file", "system"],
    default: "text",
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    default: "sent",
  },
  metadata: {
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    thumbnailUrl: String,
    width: Number,
    height: Number,
    duration: Number,
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  editHistory: [{
    content: {
      type: String,
      required: true,
    },
    editedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });

// Instance methods
messageSchema.methods.markAsDelivered = async function(): Promise<void> {
  if (this.status === "sent") {
    this.status = "delivered";
    await this.save();
  }
};

messageSchema.methods.markAsRead = async function(): Promise<void> {
  if (this.status === "sent" || this.status === "delivered") {
    this.status = "read";
    await this.save();
  }
};

messageSchema.methods.edit = async function(newContent: string): Promise<void> {
  // Store the current content in edit history
  if (!this.editHistory) {
    this.editHistory = [];
  }
  
  this.editHistory.push({
    content: this.content,
    editedAt: new Date(),
  });

  // Update content
  this.content = newContent;
  await this.save();
};

// Static methods
messageSchema.statics.findByConversation = async function(
  conversationId: Types.ObjectId,
  options: {
    limit?: number;
    before?: Date;
    after?: Date;
  } = {}
): Promise<MessageDocument[]> {
  const query: any = { conversation: conversationId };

  if (options.before) {
    query.createdAt = { ...query.createdAt, $lt: options.before };
  }

  if (options.after) {
    query.createdAt = { ...query.createdAt, $gt: options.after };
  }

  let messageQuery = this.find(query)
    .sort({ createdAt: -1 })
    .populate("sender", "name avatar")
    .populate("replyTo");

  if (options.limit) {
    messageQuery = messageQuery.limit(options.limit);
  }

  return messageQuery;
};

// Middleware
messageSchema.pre("save", async function(next) {
  // Update conversation's lastMessage
  if (this.isNew) {
    try {
      await this.model("Conversation").findByIdAndUpdate(
        this.conversation,
        {
          lastMessage: this._id,
          updatedAt: new Date(),
        }
      );
    } catch (error) {
      next(error as Error);
      return;
    }
  }
  next();
});

export const Message = model<MessageDocument, MessageModel>("Message", messageSchema);

export type { IMessage };
export default Message;
