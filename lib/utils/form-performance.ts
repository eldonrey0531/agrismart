interface FormPerformanceData {
  formId: string;
  loadTime: number;
  interactionDelay: number;
  submissionTime?: number;
  validationTime?: number;
  networkTime?: number;
  totalTime?: number;
  interactionCounts: {
    fields: Record<string, number>;
    errors: Record<string, number>;
    validations: number;
    submissions: number;
  };
}

interface FormPerformanceOptions {
  formId: string;
  reportThreshold?: number; // Time in ms to consider as slow
  sampleRate?: number; // Percentage of users to collect data from (0-1)
}

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export class FormPerformanceMonitor {
  private data: FormPerformanceData;
  private startTime: number;
  private lastInteractionTime: number;
  private options: FormPerformanceOptions;
  private isEnabled: boolean;

  constructor(options: FormPerformanceOptions) {
    this.options = {
      reportThreshold: 3000, // 3 seconds
      sampleRate: 0.1, // 10% of users
      ...options,
    };

    // Determine if this user session should be monitored
    this.isEnabled = Math.random() < (this.options.sampleRate || 0.1);

    this.startTime = performance.now();
    this.lastInteractionTime = this.startTime;
    this.data = {
      formId: options.formId,
      loadTime: 0,
      interactionDelay: 0,
      interactionCounts: {
        fields: {},
        errors: {},
        validations: 0,
        submissions: 0,
      },
    };

    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    // Measure initial form load time
    window.addEventListener('load', () => {
      this.data.loadTime = performance.now() - this.startTime;
    });

    // Setup form monitoring
    const form = document.getElementById(this.options.formId) as HTMLFormElement;
    if (!form) return;

    // Monitor field interactions
    form.querySelectorAll<FormField>('input, select, textarea').forEach((field) => {
      if (!field.name) return; // Skip fields without names

      field.addEventListener('focus', () => this.trackFieldInteraction(field.name));
      field.addEventListener('input', () => this.trackFieldInteraction(field.name));
      field.addEventListener('invalid', () => this.trackFieldError(field.name));
    });

    // Monitor form submissions
    form.addEventListener('submit', (e) => this.trackSubmission(e));
  }

  private trackFieldInteraction(fieldName: string) {
    if (!this.isEnabled) return;

    // Track interaction count
    this.data.interactionCounts.fields[fieldName] = 
      (this.data.interactionCounts.fields[fieldName] || 0) + 1;

    // Track interaction delay if this is the first interaction
    if (this.data.interactionDelay === 0) {
      this.data.interactionDelay = performance.now() - this.startTime;
    }

    this.lastInteractionTime = performance.now();
  }

  private trackFieldError(fieldName: string) {
    if (!this.isEnabled) return;

    this.data.interactionCounts.errors[fieldName] = 
      (this.data.interactionCounts.errors[fieldName] || 0) + 1;
  }

  private async trackSubmission(event: SubmitEvent) {
    if (!this.isEnabled) return;

    const submissionStart = performance.now();
    this.data.interactionCounts.submissions++;

    // Track validation time
    const validationStart = performance.now();
    const form = event.target as HTMLFormElement;
    const isValid = form.checkValidity();
    this.data.validationTime = performance.now() - validationStart;
    this.data.interactionCounts.validations++;

    if (isValid) {
      try {
        // Track network time if submission succeeds
        const networkStart = performance.now();
        await this.captureNetworkTime();
        this.data.networkTime = performance.now() - networkStart;
      } catch (error) {
        console.error('Error measuring network time:', error);
      }
    }

    // Calculate total submission time
    this.data.submissionTime = performance.now() - submissionStart;
    this.data.totalTime = performance.now() - this.startTime;

    // Report performance data if it exceeds threshold
    if (this.data.totalTime > (this.options.reportThreshold || 3000)) {
      this.reportPerformanceData();
    }
  }

  private async captureNetworkTime(): Promise<void> {
    // This is a placeholder for actual network time measurement
    // In a real implementation, you would track the actual form submission
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private reportPerformanceData() {
    // Send performance data to analytics or monitoring service
    if (window.gtag) {
      window.gtag('event', 'form_performance', {
        form_id: this.data.formId,
        load_time: Math.round(this.data.loadTime),
        interaction_delay: Math.round(this.data.interactionDelay),
        submission_time: Math.round(this.data.submissionTime || 0),
        validation_time: Math.round(this.data.validationTime || 0),
        network_time: Math.round(this.data.networkTime || 0),
        total_time: Math.round(this.data.totalTime || 0),
        interaction_counts: JSON.stringify(this.data.interactionCounts),
      });
    }

    // Log to performance monitoring service if available
    if (window.performance?.mark) {
      window.performance.mark(`${this.data.formId}-complete`);
      window.performance.measure(
        `${this.data.formId}-total`,
        `${this.data.formId}-start`,
        `${this.data.formId}-complete`
      );
    }

    // Log to browser console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Form Performance Data:', this.data.formId);
      console.table({
        'Load Time': `${Math.round(this.data.loadTime)}ms`,
        'First Interaction': `${Math.round(this.data.interactionDelay)}ms`,
        'Submission Time': `${Math.round(this.data.submissionTime || 0)}ms`,
        'Validation Time': `${Math.round(this.data.validationTime || 0)}ms`,
        'Network Time': `${Math.round(this.data.networkTime || 0)}ms`,
        'Total Time': `${Math.round(this.data.totalTime || 0)}ms`,
      });
      console.groupEnd();
    }
  }

  // Public methods for manual tracking
  public startTracking() {
    this.startTime = performance.now();
    window.performance?.mark?.(`${this.data.formId}-start`);
  }

  public stopTracking() {
    if (this.isEnabled) {
      this.data.totalTime = performance.now() - this.startTime;
      this.reportPerformanceData();
    }
  }

  public getPerformanceData(): FormPerformanceData {
    return { ...this.data };
  }
}

// Declare global gtag function
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      params: Record<string, any>
    ) => void;
  }
}

export default FormPerformanceMonitor;