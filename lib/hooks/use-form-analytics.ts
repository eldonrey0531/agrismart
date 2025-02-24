import { useEffect, useRef } from 'react';
import {
  UseFormReturn,
  FieldValues,
  FieldErrors,
  Path,
  DeepRequired,
  FieldError,
} from 'react-hook-form';
import debounce from 'lodash/debounce';

interface FormAnalyticsOptions {
  formId: string;
  formName: string;
  trackingEnabled?: boolean;
  debounceMs?: number;
}

interface FieldInteraction {
  fieldName: string;
  interactionType: 'focus' | 'blur' | 'change' | 'error';
  timestamp: number;
  value?: string;
  error?: string;
}

type WatchCallback<T extends FieldValues> = (
  value: T,
  info: { name?: Path<T>; type?: string }
) => void;

export function useFormAnalytics<T extends FieldValues>({
  formId,
  formName,
  trackingEnabled = true,
  debounceMs = 1000,
}: FormAnalyticsOptions) {
  const interactions = useRef<FieldInteraction[]>([]);
  const startTime = useRef<number>(Date.now());
  const lastFieldTime = useRef<Record<string, number>>({});

  // Track form field interactions
  const trackInteraction = (interaction: FieldInteraction) => {
    interactions.current.push(interaction);
    
    // Send analytics event
    if (window.gtag) {
      window.gtag('event', 'form_field_interaction', {
        form_id: formId,
        form_name: formName,
        field_name: interaction.fieldName,
        interaction_type: interaction.interactionType,
        time_since_start: interaction.timestamp - startTime.current,
        ...(interaction.error && { error: interaction.error }),
      });
    }
  };

  // Debounced field value tracking
  const trackFieldValue = debounce((fieldName: string, value: unknown) => {
    const now = Date.now();
    const timeSinceLastInteraction = now - (lastFieldTime.current[fieldName] || startTime.current);
    
    trackInteraction({
      fieldName,
      interactionType: 'change',
      timestamp: now,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    });

    lastFieldTime.current[fieldName] = now;

    // Track field completion time
    if (window.gtag) {
      window.gtag('event', 'field_completion', {
        form_id: formId,
        form_name: formName,
        field_name: fieldName,
        time_taken: timeSinceLastInteraction,
      });
    }
  }, debounceMs);

  // Setup form tracking
  const setupFormTracking = (form: UseFormReturn<T>) => {
    if (!trackingEnabled) return;

    // Track form start
    if (window.gtag) {
      window.gtag('event', 'form_start', {
        form_id: formId,
        form_name: formName,
        timestamp: startTime.current,
      });
    }

    // Watch form fields
    const subscription = form.watch((value: T, info: { name?: Path<T>; type?: string }) => {
      if (!info.name) return;
      
      if (info.type === 'change') {
        trackFieldValue(info.name, value[info.name]);
      }
    });

    // Track form submission
    const originalSubmit = form.handleSubmit;
    form.handleSubmit = ((
      onSubmit: (data: T) => Promise<void> | void,
      onError?: (errors: FieldErrors<T>) => void
    ) => {
      return originalSubmit(async (data) => {
        const submitTime = Date.now();
        const timeToComplete = submitTime - startTime.current;

        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            form_id: formId,
            form_name: formName,
            time_to_complete: timeToComplete,
            field_count: Object.keys(data).length,
            interaction_count: interactions.current.length,
          });
        }

        return onSubmit(data);
      }, (errors: FieldErrors<T>) => {
        // Track validation errors
        Object.entries(errors).forEach(([fieldName, error]) => {
          if (error && 'message' in error) {
            trackInteraction({
              fieldName,
              interactionType: 'error',
              timestamp: Date.now(),
              error: (error as FieldError).message,
            });
          }
        });

        if (window.gtag) {
          window.gtag('event', 'form_error', {
            form_id: formId,
            form_name: formName,
            error_count: Object.keys(errors).length,
            error_fields: Object.keys(errors),
          });
        }

        if (onError) {
          return onError(errors);
        }
      });
    }) as typeof form.handleSubmit;

    return () => {
      subscription.unsubscribe();
    };
  };

  // Get analytics data
  const getAnalytics = () => {
    const now = Date.now();
    return {
      formId,
      formName,
      timeSpent: now - startTime.current,
      interactionCount: interactions.current.length,
      interactions: interactions.current,
      fieldCompletionTimes: Object.entries(lastFieldTime.current).map(
        ([fieldName, timestamp]) => ({
          fieldName,
          completionTime: timestamp - startTime.current,
        })
      ),
    };
  };

  return {
    setupFormTracking,
    getAnalytics,
    trackInteraction,
  };
}

// Add window.gtag type definition
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      params: Record<string, unknown>
    ) => void;
  }
}

export default useFormAnalytics;