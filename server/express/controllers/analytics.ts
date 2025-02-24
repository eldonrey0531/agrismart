import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware";
import { analyticsService } from "../services/AnalyticsService";
import { AppError } from "../utils/app-error";
import type { AnalyticsEventType } from "../models/Analytics";

// Get marketplace analytics
export const getMarketplaceAnalytics = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const analytics = await analyticsService.getMarketplaceAnalytics(startDate, endDate);

  return res.json({
    success: true,
    data: analytics,
  });
});

// Get chat analytics
export const getChatAnalytics = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const analytics = await analyticsService.getChatAnalytics(startDate, endDate);

  return res.json({
    success: true,
    data: analytics,
  });
});

// Get user analytics
export const getUserAnalytics = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const analytics = await analyticsService.getUserAnalytics(startDate, endDate);

  return res.json({
    success: true,
    data: analytics,
  });
});

// Get search analytics
export const getSearchAnalytics = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const analytics = await analyticsService.getSearchAnalytics(startDate, endDate);

  return res.json({
    success: true,
    data: analytics,
  });
});

// Get raw events
export const getEvents = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const { type } = req.query;

  if (!type) {
    throw new AppError("Event type is required", 400);
  }

  const events = await analyticsService.getEvents(
    type as AnalyticsEventType,
    startDate,
    endDate
  );

  return res.json({
    success: true,
    data: events,
  });
});

// Get aggregated data
export const getAggregates = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { startDate, endDate } = getDateRange(req);
  const { types } = req.query;

  const eventTypes = types ? (types as string).split(",") as AnalyticsEventType[] : undefined;
  const aggregates = await analyticsService.getAggregates(startDate, endDate, eventTypes);

  return res.json({
    success: true,
    data: aggregates,
  });
});

// Helper function to parse date range from request
function getDateRange(req: Request): { startDate: Date; endDate: Date } {
  const { start, end } = req.query;

  if (!start || !end) {
    throw new AppError("Start and end dates are required", 400);
  }

  const startDate = new Date(start as string);
  const endDate = new Date(end as string);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new AppError("Invalid date format", 400);
  }

  if (startDate > endDate) {
    throw new AppError("Start date cannot be after end date", 400);
  }

  // Limit date range to 30 days
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 30) {
    throw new AppError("Date range cannot exceed 30 days", 400);
  }

  return { startDate, endDate };
}

export default {
  getMarketplaceAnalytics,
  getChatAnalytics,
  getUserAnalytics,
  getSearchAnalytics,
  getEvents,
  getAggregates,
};