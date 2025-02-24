import { Types } from 'mongoose';
import { Report, FilterRule } from '../models/ContentModeration';
import type {
  ModeratedContentType,
  ReportReason,
  ReportStatus,
  FilterRuleType,
} from '../models/ContentModeration';
import { NotFoundError, BadRequestError } from '../utils/app-error';
import { notificationService } from './NotificationService';

export class ContentModerationService {
  /**
   * Create a new content report
   */
  async createReport(data: {
    contentType: ModeratedContentType;
    contentId: string;
    reportedBy: string;
    reason: ReportReason;
    description: string;
    metadata?: Record<string, any>;
  }) {
    // Create report
    const report = await Report.create({
      ...data,
      status: 'pending',
    });

    // Notify moderators
    notificationService.broadcastEvent({
      type: 'admin_action',
      payload: {
        action: 'new_report',
        reportId: report._id,
        contentType: data.contentType,
        reason: data.reason,
      },
      metadata: {
        priority: this.getReportPriority(data.reason),
      },
    });

    return report;
  }

  /**
   * Get report priority based on reason
   */
  private getReportPriority(reason: ReportReason): 'high' | 'medium' | 'low' {
    switch (reason) {
      case 'illegal':
      case 'offensive':
        return 'high';
      case 'fake':
      case 'spam':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Assign report to moderator
   */
  async assignReport(reportId: string, moderatorId: string) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    await report.assign(moderatorId);

    // Notify original reporter
    notificationService.broadcastEvent({
      type: 'system_alert',
      payload: {
        message: 'Your report is being investigated',
        reportId: report._id,
      },
      userId: report.reportedBy.toString(),
    });

    return report;
  }

  /**
   * Resolve a report
   */
  async resolveReport(reportId: string, moderatorId: string, resolution: string) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    await report.resolve(moderatorId, resolution);

    // Notify original reporter
    notificationService.broadcastEvent({
      type: 'system_alert',
      payload: {
        message: 'Your report has been resolved',
        reportId: report._id,
        resolution,
      },
      userId: report.reportedBy.toString(),
    });

    return report;
  }

  /**
   * Reject a report
   */
  async rejectReport(reportId: string, moderatorId: string, reason: string) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    await report.reject(moderatorId, reason);

    // Notify original reporter
    notificationService.broadcastEvent({
      type: 'system_alert',
      payload: {
        message: 'Your report has been rejected',
        reportId: report._id,
        reason,
      },
      userId: report.reportedBy.toString(),
    });

    return report;
  }

  /**
   * Get reports by status
   */
  async getReportsByStatus(status: ReportStatus) {
    return Report.find({ status })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email');
  }

  /**
   * Create content filter rule
   */
  async createFilterRule(data: {
    type: FilterRuleType;
    pattern: string;
    action: 'flag' | 'block' | 'delete';
    severity: 'low' | 'medium' | 'high';
    createdBy: string;
    metadata?: Record<string, any>;
  }) {
    // Validate pattern based on type
    if (data.type === 'pattern') {
      try {
        new RegExp(data.pattern);
      } catch (error) {
        throw new BadRequestError('Invalid regex pattern');
      }
    }

    return await FilterRule.create({
      ...data,
      isActive: true,
    });
  }

  /**
   * Update filter rule status
   */
  async toggleFilterRule(ruleId: string) {
    const rule = await FilterRule.findById(ruleId);
    if (!rule) {
      throw new NotFoundError('Filter rule not found');
    }

    await rule.toggleActive();
    return rule;
  }

  /**
   * Test content against active filter rules
   */
  async testContent(content: string) {
    return await FilterRule.testContent(content);
  }

  /**
   * Get active filter rules
   */
  async getActiveRules() {
    return await FilterRule.findActiveRules();
  }

  /**
   * Get reports for specific content
   */
  async getContentReports(contentType: ModeratedContentType, contentId: string) {
    return await Report.findReportsByContent(contentType, contentId);
  }

  /**
   * Get pending reports count
   */
  async getPendingReportsCount(): Promise<number> {
    return await Report.countDocuments({ status: 'pending' });
  }
}

// Create singleton instance
export const contentModerationService = new ContentModerationService();
export default contentModerationService;