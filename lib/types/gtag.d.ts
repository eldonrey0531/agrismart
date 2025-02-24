interface GtagParams extends Record<string, any> {
  form_id?: string;
  form_name?: string;
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

declare global {
  interface Window {
    gtag?: (command: 'event', action: string, params: GtagParams) => void;
  }
}