// Generic field error interface to replace react-hook-form dependency
export interface FieldError {
  type: string;
  message: string;
}

export interface FormAccessibilityOptions {
  formId: string;
  formName: string;
  announceErrors?: boolean;
  announceSaving?: boolean;
  announceSuccess?: boolean;
  customAnnouncements?: FormAnnouncements;
}

export interface FormAnnouncements {
  saving?: string;
  saved?: string;
  error?: string;
  success?: string;
  required?: string;
  invalid?: string;
  [key: string]: string | undefined;
}

export interface FormFieldAnnouncement {
  fieldName: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface FormErrorMap {
  [key: string]: FieldError;
}

export interface FormAccessibilityState {
  announcements: FormAnnouncement[];
  focusedField: string | null;
  lastError: string | null;
  lastSuccess: string | null;
}

export interface FormAnnouncement {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
  timestamp: number;
}

export interface FormAccessibilityReturn {
  setupFormAccessibility: (form: any) => () => void;
  setupKeyboardNavigation: () => void;
  announce: (message: string) => void;
  announceFormState: {
    saving: () => void;
    saved: () => void;
    success: () => void;
    error: (message?: string) => void;
    custom: (message: string) => void;
  };
  getFieldAnnouncement: (fieldName: string, error?: string) => string;
}

export const DEFAULT_ANNOUNCEMENTS: Required<FormAnnouncements> = {
  saving: 'Saving form...',
  saved: 'Form has been saved',
  error: 'Form has errors. Please review the form.',
  success: 'Form submitted successfully',
  required: 'This field is required',
  invalid: 'This field is invalid',
};