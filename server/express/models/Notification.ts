import { Schema, model, Document, Model } from "mongoose";

export type NotificationType =
  | "seller_verification"
  | "order_status"
  | "chat_message"
  | "product_interest"
  | "system_alert"
  | "user_role_update"
  | "user_status_update"
  | "admin_action"
  | "account_alert"
  // Buyer notifications
  | "order_placed"
  | "order_shipped"
  | "order_delivered"
  | "price_drop"
  | "back_in_stock"
  // Seller notifications
  | "new_order"
  | "order_cancelled"
  | "product_review"
  | "stock_low"
  | "seller_verification_approved"
  | "seller_verification_rejected";

export type NotificationPriority = "low" | "medium" | "high";

export interface INotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Interface for Notification Document
export interface NotificationDocument extends INotification, Document {
  markAsRead(): Promise<void>;
  archive(): Promise<void>;
}

// Interface for Notification Model
export interface NotificationModel extends Model<NotificationDocument> {
  createNotification(data: Omit<INotification, "isRead" | "isArchived" | "createdAt">): Promise<NotificationDocument>;
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
}

// Notification Schema
const notificationSchema = new Schema<NotificationDocument, NotificationModel>({
  userId: {
    type: String,
    ref: "User",
    required: true,
    index: true,
    validate: {
      validator: (v: string) => /^[0-9a-fA-F]{24}$/.test(v),
      message: "Invalid ObjectId format"
    }
  },
  type: {
    type: String,
    required: true,
    enum: [
      "seller_verification",
      "order_status",
      "chat_message",
      "product_interest",
      "system_alert",
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  data: {
    type: Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Instance method to mark notification as read
notificationSchema.methods.markAsRead = async function(): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Instance method to archive notification
notificationSchema.methods.archive = async function(): Promise<void> {
  this.isArchived = true;
  await this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(
  data: Omit<INotification, "isRead" | "isArchived" | "createdAt">
): Promise<NotificationDocument> {
  return this.create({
    ...data,
    isRead: false,
    isArchived: false,
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(
  userId: string
): Promise<number> {
  return this.countDocuments({
    userId,
    isRead: false,
    isArchived: false,
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(
  userId: string
): Promise<void> {
  const now = new Date();
  await this.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: now,
    }
  );
};

// Create model
export const Notification = model<NotificationDocument, NotificationModel>(
  "Notification",
  notificationSchema
);

export default Notification;