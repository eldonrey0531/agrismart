// Basic analytics event parameters
export interface BaseEventParams extends Record<string, any> {
  event_category?: string;
  event_label?: string;
  value?: number;
}

// Form-specific analytics parameters
export interface FormAnalyticsEventParams extends BaseEventParams {
  form_id: string;
  form_name: string;
  field_name?: string;
  interaction_type?: string;
  time_since_start?: number;
  error?: string;
  time_taken?: number;
  time_to_complete?: number;
  field_count?: number;
  interaction_count?: number;
  error_count?: number;
  error_fields?: string[];
  timestamp?: number;
}

// Form field types
export interface FormFieldError {
  type: string;
  message: string;
}

// Analytics metrics types
export interface FormAnalyticsMetrics {
  formId: string;
  formName: string;
  timeSpent: number;
  interactionCount: number;
  interactions: FieldInteraction[];
  fieldCompletionTimes: FieldCompletionTime[];
}

// Field interaction types
export interface FieldInteraction {
  fieldName: string;
  interactionType: 'focus' | 'blur' | 'change' | 'error';
  timestamp: number;
  value?: string;
  error?: string;
}

export interface FieldCompletionTime {
  fieldName: string;
  completionTime: number;
}

// Configuration types
export interface FormAnalyticsOptions {
  formId: string;
  formName: string;
  trackingEnabled?: boolean;
  debounceMs?: number;
}

// Form watch types
export interface FormWatchInfo {
  name?: string;
  type?: string;
}

// Hook return types
export interface FormAnalyticsReturn {
  setupFormTracking: (form: any) => () => void;
  getAnalytics: () => FormAnalyticsMetrics;
  trackInteraction: (interaction: FieldInteraction) => void;
}

// Analytics tracking function type
export type AnalyticsTrackingFunction = (
  command: 'event',
  action: string,
  params: Record<string, any>
) => void;

// Re-export for convenience
export type GtagFunction = AnalyticsTrackingFunction;