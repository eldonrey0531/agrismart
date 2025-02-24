/**
 * Security Event Types
 */
export const SecurityEventTypes = {
  LOGIN: 'LOGIN',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  SECURITY_UPDATE: 'SECURITY_UPDATE',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
} as const;

export type SecurityEventType = keyof typeof SecurityEventTypes;

/**
 * Security Event Status
 */
export const SecurityEventStatus = {
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;

export type SecurityEventStatusType = keyof typeof SecurityEventStatus;

/**
 * Security Event
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  title: string;
  description: string;
  timestamp: Date;
  status: SecurityEventStatusType;
  userId: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Security Event Filters
 */
export interface SecurityEventFilters {
  type?: SecurityEventType[];
  status?: SecurityEventStatusType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Security Event Response
 */
export interface SecurityEventsResponse {
  events: SecurityEvent[];
  total: number;
}

/**
 * Security Event Create Input
 */
export interface SecurityEventCreateInput {
  type: SecurityEventType;
  title: string;
  description: string;
  status: SecurityEventStatusType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Security Event Update Input
 */
export type SecurityEventUpdateInput = Partial<SecurityEventCreateInput>;