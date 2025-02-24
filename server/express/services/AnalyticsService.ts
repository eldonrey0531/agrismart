import { Types } from 'mongoose';
import { AnalyticsEvent, AnalyticsAggregate, AnalyticsEventType } from '../models/Analytics';
import { NotFoundError } from '../utils/app-error';

export class AnalyticsService {
  /**
   * Log an analytics event
   */
  async logEvent(params: {
    type: AnalyticsEventType;
    metadata: Record<string, any>;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await AnalyticsEvent.logEvent(
      params.type,
      params.metadata,
      params.userId,
      params.ip,
      params.userAgent
    );
  }

  /**
   * Get events by type within a date range
   */
  async getEventsByType(
    type: AnalyticsEventType,
    startDate: Date,
    endDate: Date
  ) {
    return await AnalyticsEvent.getEventsByType(type, startDate, endDate);
  }

  /**
   * Get aggregated analytics data
   */
  async getAggregatedData(params: {
    startDate: Date;
    endDate: Date;
    eventTypes?: AnalyticsEventType[];
  }) {
    return await AnalyticsAggregate.getAggregates(
      params.startDate,
      params.endDate,
      params.eventTypes
    );
  }

  /**
   * Run daily aggregation for a specific date
   */
  async runDailyAggregation(date: Date = new Date()): Promise<void> {
    await AnalyticsAggregate.aggregateEvents(date);
  }

  /**
   * Get user activity analytics
   */
  async getUserActivity(userId: string, startDate: Date, endDate: Date) {
    return await AnalyticsEvent.find({
      userId,
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: -1 });
  }

  /**
   * Get marketplace analytics
   */
  async getMarketplaceAnalytics(startDate: Date, endDate: Date) {
    const marketplaceEvents = [
      'product_creation',
      'product_view',
      'order_creation',
      'order_status_change',
    ] as AnalyticsEventType[];

    return await this.getAggregatedData({
      startDate,
      endDate,
      eventTypes: marketplaceEvents,
    });
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(startDate: Date, endDate: Date) {
    const engagementEvents = [
      'user_login',
      'chat_message',
      'product_view',
      'search_query',
    ] as AnalyticsEventType[];

    return await this.getAggregatedData({
      startDate,
      endDate,
      eventTypes: engagementEvents,
    });
  }

  /**
   * Get moderation activity analytics
   */
  async getModerationAnalytics(startDate: Date, endDate: Date) {
    const moderationEvents = [
      'content_report',
      'report_assignment',
      'report_resolution',
      'report_rejection',
      'content_flag',
      'content_block',
      'content_delete',
    ] as AnalyticsEventType[];

    return await this.getAggregatedData({
      startDate,
      endDate,
      eventTypes: moderationEvents,
    });
  }

  /**
   * Get admin activity analytics
   */
  async getAdminActivityAnalytics(startDate: Date, endDate: Date) {
    const adminEvents = [
      'admin_login',
      'admin_action',
      'system_config_update',
      'user_role_update',
      'user_status_update',
    ] as AnalyticsEventType[];

    return await this.getAggregatedData({
      startDate,
      endDate,
      eventTypes: adminEvents,
    });
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(startDate: Date, endDate: Date) {
    const searchEvents = await AnalyticsEvent.find({
      type: 'search_query',
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: -1 });

    // Aggregate search terms
    const searchTerms = searchEvents.reduce((acc, event) => {
      const term = event.metadata.query?.toLowerCase();
      if (term) {
        acc[term] = (acc[term] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Sort by frequency
    const sortedTerms = Object.entries(searchTerms)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [term, count]) => {
        acc[term] = count;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalSearches: searchEvents.length,
      uniqueTerms: Object.keys(searchTerms).length,
      popularTerms: sortedTerms,
      events: searchEvents,
    };
  }

  /**
   * Get real-time analytics snapshot
   */
  async getRealTimeSnapshot(minutes: number = 5) {
    const startTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const events = await AnalyticsEvent.find({
      timestamp: { $gte: startTime },
    }).sort({ timestamp: -1 });

    // Group by event type
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      periodMinutes: minutes,
      totalEvents: events.length,
      eventDistribution: eventsByType,
      recentEvents: events.slice(0, 100), // Last 100 events
    };
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;