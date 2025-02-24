import { Schema, model, Document, Model, Types } from "mongoose";

// Content types that can be reported/moderated
export type ModeratedContentType = "product" | "user" | "chat" | "review";

// Report reason categories
export type ReportReason =
  | "inappropriate"
  | "spam"
  | "fake"
  | "offensive"
  | "illegal"
  | "other";

// Report status
export type ReportStatus = "pending" | "investigating" | "resolved" | "rejected";

// Content filtering rule type
export type FilterRuleType = "keyword" | "pattern" | "image";

// Report interface
interface IReport {
  contentType: ModeratedContentType;
  contentId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  assignedTo?: Types.ObjectId;
  resolution?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

// Filter rule interface
interface IFilterRule {
  type: FilterRuleType;
  pattern: string;
  action: "flag" | "block" | "delete";
  severity: "low" | "medium" | "high";
  isActive: boolean;
  createdBy: Types.ObjectId;
  metadata?: Record<string, any>;
}

// Document interfaces
interface ReportDocument extends IReport, Document {
  assign(moderatorId: string): Promise<void>;
  resolve(moderatorId: string, resolution: string): Promise<void>;
  reject(moderatorId: string, reason: string): Promise<void>;
}

interface FilterRuleDocument extends IFilterRule, Document {
  toggleActive(): Promise<void>;
  test(content: string): boolean;
}

// Model interfaces
interface ReportModel extends Model<ReportDocument> {
  findPendingReports(): Promise<ReportDocument[]>;
  findReportsByContent(contentType: ModeratedContentType, contentId: string): Promise<ReportDocument[]>;
}

interface FilterRuleModel extends Model<FilterRuleDocument> {
  findActiveRules(): Promise<FilterRuleDocument[]>;
  testContent(content: string): Promise<{ matched: boolean; rules: FilterRuleDocument[] }>;
}

// Report Schema
const reportSchema = new Schema<ReportDocument, ReportModel>({
  contentType: {
    type: String,
    required: true,
    enum: ["product", "user", "chat", "review"],
  },
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "contentType",
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ["inappropriate", "spam", "fake", "offensive", "illegal", "other"],
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "investigating", "resolved", "rejected"],
    default: "pending",
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  resolution: String,
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  resolvedAt: Date,
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Filter Rule Schema
const filterRuleSchema = new Schema<FilterRuleDocument, FilterRuleModel>({
  type: {
    type: String,
    required: true,
    enum: ["keyword", "pattern", "image"],
  },
  pattern: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ["flag", "block", "delete"],
  },
  severity: {
    type: String,
    required: true,
    enum: ["low", "medium", "high"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ contentType: 1, contentId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportedBy: 1 });
filterRuleSchema.index({ type: 1, isActive: 1 });

// Report Methods
reportSchema.methods.assign = async function(moderatorId: string): Promise<void> {
  this.status = "investigating";
  this.assignedTo = moderatorId;
  await this.save();
};

reportSchema.methods.resolve = async function(moderatorId: string, resolution: string): Promise<void> {
  this.status = "resolved";
  this.resolution = resolution;
  this.resolvedBy = moderatorId;
  this.resolvedAt = new Date();
  await this.save();
};

reportSchema.methods.reject = async function(moderatorId: string, reason: string): Promise<void> {
  this.status = "rejected";
  this.resolution = reason;
  this.resolvedBy = moderatorId;
  this.resolvedAt = new Date();
  await this.save();
};

// Report Statics
reportSchema.statics.findPendingReports = function(): Promise<ReportDocument[]> {
  return this.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("reportedBy", "name email")
    .populate("assignedTo", "name email");
};

reportSchema.statics.findReportsByContent = function(
  contentType: ModeratedContentType,
  contentId: string
): Promise<ReportDocument[]> {
  return this.find({
    contentType,
    contentId,
  }).sort({ createdAt: -1 });
};

// Filter Rule Methods
filterRuleSchema.methods.toggleActive = async function(): Promise<void> {
  this.isActive = !this.isActive;
  await this.save();
};

filterRuleSchema.methods.test = function(content: string): boolean {
  if (!this.isActive) return false;

  if (this.type === "keyword") {
    return content.toLowerCase().includes(this.pattern.toLowerCase());
  }

  if (this.type === "pattern") {
    try {
      const regex = new RegExp(this.pattern, "i");
      return regex.test(content);
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return false;
    }
  }

  return false;
};

// Filter Rule Statics
filterRuleSchema.statics.findActiveRules = function(): Promise<FilterRuleDocument[]> {
  return this.find({ isActive: true }).sort({ severity: -1 });
};

filterRuleSchema.statics.testContent = async function(
  content: string
): Promise<{ matched: boolean; rules: FilterRuleDocument[] }> {
  const activeRules = await this.findActiveRules();
  const matchedRules = activeRules.filter(rule => rule.test(content));

  return {
    matched: matchedRules.length > 0,
    rules: matchedRules,
  };
};

export const Report = model<ReportDocument, ReportModel>("Report", reportSchema);
export const FilterRule = model<FilterRuleDocument, FilterRuleModel>("FilterRule", filterRuleSchema);

export default {
  Report,
  FilterRule,
};