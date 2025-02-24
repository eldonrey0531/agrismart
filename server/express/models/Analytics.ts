import { Schema, model, Document, Model, Types } from "mongoose";

// Analytics Event Types
export type AnalyticsEventType =
  | "user_registration"
  | "seller_verification"
  | "product_creation"
  | "product_view"
  | "order_creation"
  | "order_status_change"
  | "chat_message"
  | "user_login"
  | "search_query"
  | "user_role_update"
  | "user_status_update"
  | "user_deletion"
  | "admin_login"
  | "admin_action"
  | "system_config_update"
  // Content Moderation Events
  | "content_report"
  | "report_assignment"
  | "report_resolution"
  | "report_rejection"
  | "filter_rule_creation"
  | "filter_rule_toggle"
  | "content_flag"
  | "content_block"
  | "content_delete";

// Analytics Data Interface
interface IAnalyticsEvent {
  type: AnalyticsEventType;
  userId?: Types.ObjectId;
  metadata: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// Analytics Aggregate Interface
interface IAnalyticsAggregate {
  date: Date;
  eventType: AnalyticsEventType;
  count: number;
  metadata: Record<string, any>;
}

// Document Interfaces
interface AnalyticsEventDocument extends IAnalyticsEvent, Document {}
interface AnalyticsAggregateDocument extends IAnalyticsAggregate, Document {}

// Model Interfaces
interface AnalyticsEventModel extends Model<AnalyticsEventDocument> {
  logEvent(
    type: AnalyticsEventType,
    metadata: Record<string, any>,
    userId?: string,
    ip?: string,
    userAgent?: string
  ): Promise<AnalyticsEventDocument>;
  getEventsByType(
    type: AnalyticsEventType,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsEventDocument[]>;
}

interface AnalyticsAggregateModel extends Model<AnalyticsAggregateDocument> {
  aggregateEvents(date: Date): Promise<void>;
  getAggregates(
    startDate: Date,
    endDate: Date,
    eventTypes?: AnalyticsEventType[]
  ): Promise<AnalyticsAggregateDocument[]>;
}

// Event Schema
const analyticsEventSchema = new Schema<AnalyticsEventDocument, AnalyticsEventModel>({
  type: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ip: String,
  userAgent: String,
});

// Aggregate Schema
const analyticsAggregateSchema = new Schema<AnalyticsAggregateDocument, AnalyticsAggregateModel>({
  date: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

// Indexes
analyticsEventSchema.index({ timestamp: 1, type: 1 });
analyticsAggregateSchema.index({ date: 1, eventType: 1 }, { unique: true });

// Event Methods
analyticsEventSchema.statics.logEvent = async function(
  type: AnalyticsEventType,
  metadata: Record<string, any>,
  userId?: string,
  ip?: string,
  userAgent?: string
): Promise<AnalyticsEventDocument> {
  return this.create({
    type,
    userId,
    metadata,
    ip,
    userAgent,
  });
};

analyticsEventSchema.statics.getEventsByType = async function(
  type: AnalyticsEventType,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEventDocument[]> {
  return this.find({
    type,
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ timestamp: -1 });
};

// Aggregate Methods
analyticsAggregateSchema.statics.aggregateEvents = async function(date: Date): Promise<void> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        metadata: {
          $push: "$metadata",
        },
      },
    },
  ]);

  for (const event of events) {
    await this.findOneAndUpdate(
      {
        date: startOfDay,
        eventType: event._id,
      },
      {
        $set: {
          count: event.count,
          metadata: {
            aggregatedData: event.metadata,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
};

analyticsAggregateSchema.statics.getAggregates = async function(
  startDate: Date,
  endDate: Date,
  eventTypes?: AnalyticsEventType[]
): Promise<AnalyticsAggregateDocument[]> {
  const query: any = {
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (eventTypes && eventTypes.length > 0) {
    query.eventType = { $in: eventTypes };
  }

  return this.find(query).sort({ date: 1 });
};

// Create models
export const AnalyticsEvent = model<AnalyticsEventDocument, AnalyticsEventModel>(
  "AnalyticsEvent",
  analyticsEventSchema
);

export const AnalyticsAggregate = model<AnalyticsAggregateDocument, AnalyticsAggregateModel>(
  "AnalyticsAggregate",
  analyticsAggregateSchema
);

export default {
  AnalyticsEvent,
  AnalyticsAggregate,
};