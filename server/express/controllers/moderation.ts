import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware";
import { contentModerationService } from "../services/ContentModerationService";
import { AppError, NotFoundError } from "../utils/app-error";
import { ModeratedContentType, ReportReason, FilterRuleType } from "../models/ContentModeration";

// Report content
export const reportContent = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const {
    contentType,
    contentId,
    reason,
    description,
    metadata
  } = req.body as {
    contentType: ModeratedContentType;
    contentId: string;
    reason: ReportReason;
    description: string;
    metadata?: Record<string, any>;
  };

  await contentModerationService.reportContent(
    contentType,
    contentId,
    req.user!.id,
    reason,
    description,
    metadata
  );

  return res.json({
    success: true,
    message: "Content reported successfully",
  });
});

// Filter content
export const filterContent = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { content } = req.body as { content: string };

  const result = await contentModerationService.filterContent(content);

  return res.json({
    success: true,
    data: result,
  });
});

// Get pending reports
export const getPendingReports = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const reports = await contentModerationService.getPendingReports();

  return res.json({
    success: true,
    data: reports,
  });
});

// Get reports for specific content
export const getContentReports = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { contentType, contentId } = req.params as {
    contentType: ModeratedContentType;
    contentId: string;
  };

  const reports = await contentModerationService.getReportsForContent(
    contentType,
    contentId
  );

  return res.json({
    success: true,
    data: reports,
  });
});

// Assign report to moderator
export const assignReport = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { reportId } = req.params;

  await contentModerationService.assignReport(reportId, req.user!.id);

  return res.json({
    success: true,
    message: "Report assigned successfully",
  });
});

// Resolve report
export const resolveReport = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { reportId } = req.params;
  const { resolution, action } = req.body;

  await contentModerationService.resolveReport(
    reportId,
    req.user!.id,
    resolution,
    action
  );

  return res.json({
    success: true,
    message: "Report resolved successfully",
  });
});

// Reject report
export const rejectReport = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { reportId } = req.params;
  const { reason } = req.body;

  await contentModerationService.rejectReport(reportId, req.user!.id, reason);

  return res.json({
    success: true,
    message: "Report rejected successfully",
  });
});

// Create filter rule
export const createFilterRule = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const {
    type,
    pattern,
    action,
    severity,
    metadata
  } = req.body as {
    type: FilterRuleType;
    pattern: string;
    action: "flag" | "block" | "delete";
    severity: "low" | "medium" | "high";
    metadata?: Record<string, any>;
  };

  const rule = await contentModerationService.createFilterRule(
    type,
    pattern,
    action,
    severity,
    req.user!.id,
    metadata
  );

  return res.json({
    success: true,
    data: rule,
  });
});

// Toggle filter rule
export const toggleFilterRule = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { ruleId } = req.params;

  await contentModerationService.toggleFilterRule(ruleId, req.user!.id);

  return res.json({
    success: true,
    message: "Filter rule toggled successfully",
  });
});

// Get active filter rules
export const getActiveFilterRules = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const rules = await contentModerationService.getActiveFilterRules();

  return res.json({
    success: true,
    data: rules,
  });
});

export default {
  reportContent,
  filterContent,
  getPendingReports,
  getContentReports,
  assignReport,
  resolveReport,
  rejectReport,
  createFilterRule,
  toggleFilterRule,
  getActiveFilterRules,
};