import { Schema, model, Document, Types, Model } from "mongoose";
import { UserDocument } from "./User";

interface IParticipant {
  user: Types.ObjectId | UserDocument;
  joinedAt: Date;
  lastRead?: Date;
  isActive: boolean;
}

interface IConversation {
  title?: string;
  participants: IParticipant[];
  lastMessage?: Types.ObjectId;
  type: "direct" | "group";
  createdBy: Types.ObjectId | UserDocument;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Conversation Document (instance methods)
export interface ConversationDocument extends Omit<IConversation, 'id'>, Document {
  addParticipant(userId: Types.ObjectId): Promise<void>;
  removeParticipant(userId: Types.ObjectId): Promise<void>;
  updateLastRead(userId: Types.ObjectId): Promise<void>;
  isParticipant(userId: Types.ObjectId): boolean;
}

// Interface for Conversation Model (static methods)
export interface ConversationModel extends Model<ConversationDocument> {
  findDirectChat(user1Id: Types.ObjectId, user2Id: Types.ObjectId): Promise<ConversationDocument | null>;
  findUserConversations(userId: Types.ObjectId): Promise<ConversationDocument[]>;
}

const participantSchema = new Schema<IParticipant>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastRead: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const conversationSchema = new Schema<ConversationDocument, ConversationModel>({
  title: {
    type: String,
    trim: true,
  },
  participants: [participantSchema],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  type: {
    type: String,
    enum: ["direct", "group"],
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
conversationSchema.index({ "participants.user": 1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ isActive: 1 });

// Instance Methods
conversationSchema.methods.addParticipant = async function(
  userId: Types.ObjectId
): Promise<void> {
  if (!this.isParticipant(userId)) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      isActive: true,
    });
    await this.save();
  }
};

conversationSchema.methods.removeParticipant = async function(
  userId: Types.ObjectId
): Promise<void> {
  const participant = this.participants.find(
    (p: IParticipant) => p.user.toString() === userId.toString()
  );
  if (participant) {
    participant.isActive = false;
    await this.save();
  }
};

conversationSchema.methods.updateLastRead = async function(
  userId: Types.ObjectId
): Promise<void> {
  const participant = this.participants.find(
    (p: IParticipant) => p.user.toString() === userId.toString()
  );
  if (participant) {
    participant.lastRead = new Date();
    await this.save();
  }
};

conversationSchema.methods.isParticipant = function(
  userId: Types.ObjectId
): boolean {
  return this.participants.some(
    (p: IParticipant) => p.user.toString() === userId.toString() && p.isActive
  );
};

// Static Methods
conversationSchema.statics.findDirectChat = async function(
  user1Id: Types.ObjectId,
  user2Id: Types.ObjectId
): Promise<ConversationDocument | null> {
  return this.findOne({
    type: "direct",
    "participants.user": { $all: [user1Id, user2Id] },
    isActive: true,
  }).populate("participants.user", "name avatar");
};

conversationSchema.statics.findUserConversations = async function(
  userId: Types.ObjectId
): Promise<ConversationDocument[]> {
  return this.find({
    "participants": {
      $elemMatch: {
        user: userId,
        isActive: true,
      },
    },
    isActive: true,
  })
    .populate("participants.user", "name avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
};

// Middleware
conversationSchema.pre("save", function(next) {
  // Ensure at least 2 participants for direct chats
  if (this.type === "direct" && this.participants.length !== 2) {
    next(new Error("Direct conversations must have exactly 2 participants"));
    return;
  }
  next();
});

export const Conversation = model<ConversationDocument, ConversationModel>(
  "Conversation",
  conversationSchema
);

export type { IConversation, IParticipant };
export default Conversation;
