interface PerformanceTestConfig {
  formId: string;
  iterations?: number;
  simulateTyping?: boolean;
  typingDelay?: number;
  fieldValues?: Record<string, string | boolean>;
  validationDelay?: number;
  submissionDelay?: number;
}

interface PerformanceTestResult {
  averageLoadTime: number;
  averageInteractionTime: number;
  averageSubmissionTime: number;
  averageValidationTime: number;
  errorRate: number;
  totalTestTime: number;
  testIterations: number;
  fieldResults: Record<string, {
    averageInputTime: number;
    errorCount: number;
    validationTime: number;
  }>;
}

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export class FormPerformanceTester {
  private config: Required<PerformanceTestConfig>;
  private results: PerformanceTestResult;
  private form: HTMLFormElement | null;
  private isRunning: boolean;

  constructor(config: PerformanceTestConfig) {
    this.config = {
      iterations: 5,
      simulateTyping: true,
      typingDelay: 50,
      validationDelay: 100,
      submissionDelay: 500,
      fieldValues: {},
      ...config,
    };

    this.results = {
      averageLoadTime: 0,
      averageInteractionTime: 0,
      averageSubmissionTime: 0,
      averageValidationTime: 0,
      errorRate: 0,
      totalTestTime: 0,
      testIterations: 0,
      fieldResults: {},
    };

    this.form = null;
    this.isRunning = false;
  }

  private async simulateTyping(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const chars = value.split('');
    for (const char of chars) {
      if (!this.isRunning) break;
      field.value += char;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, this.config.typingDelay));
    }
  }

  private async fillField(field: FormField, value: string | boolean) {
    const startTime = performance.now();

    if (field instanceof HTMLInputElement) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        field.checked = Boolean(value);
        field.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        if (this.config.simulateTyping) {
          await this.simulateTyping(field, String(value));
        } else {
          field.value = String(value);
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else if (field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      field.value = String(value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, this.config.validationDelay));

    const endTime = performance.now();
    return endTime - startTime;
  }

  private async runTestIteration(): Promise<void> {
    if (!this.form) return;

    const iterationStart = performance.now();
    const fields = Array.from(
      this.form.querySelectorAll<FormField>('input, textarea, select')
    );

    // Reset form
    this.form.reset();

    // Fill each field
    for (const field of fields) {
      if (!this.isRunning) break;

      const fieldName = field.getAttribute('name') || field.id;
      if (!fieldName) continue;

      const fieldValue = this.config.fieldValues[fieldName] ?? 'test value';
      const fillTime = await this.fillField(field, fieldValue);

      // Track field results
      if (!this.results.fieldResults[fieldName]) {
        this.results.fieldResults[fieldName] = {
          averageInputTime: 0,
          errorCount: 0,
          validationTime: 0,
        };
      }

      const currentResults = this.results.fieldResults[fieldName];
      currentResults.averageInputTime = 
        (currentResults.averageInputTime * this.results.testIterations + fillTime) /
        (this.results.testIterations + 1);

      // Check for validation errors
      if ('checkValidity' in field && typeof field.checkValidity === 'function' && !field.checkValidity()) {
        currentResults.errorCount++;
      }
    }

    // Submit form
    const submissionStart = performance.now();
    this.form.dispatchEvent(new Event('submit', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, this.config.submissionDelay));

    const iterationTime = performance.now() - iterationStart;
    this.results.totalTestTime += iterationTime;
    this.results.testIterations++;

    // Update averages
    this.results.averageSubmissionTime =
      (this.results.averageSubmissionTime * (this.results.testIterations - 1) +
        (performance.now() - submissionStart)) /
      this.results.testIterations;
  }

  public async runTests(): Promise<PerformanceTestResult> {
    this.form = document.getElementById(this.config.formId) as HTMLFormElement;
    if (!this.form) {
      throw new Error(`Form with ID "${this.config.formId}" not found`);
    }

    this.isRunning = true;
    const startTime = performance.now();

    try {
      // Prevent actual form submissions
      const originalSubmit = this.form.submit;
      this.form.submit = () => {};

      // Run test iterations
      for (let i = 0; i < this.config.iterations; i++) {
        if (!this.isRunning) break;
        await this.runTestIteration();

        // Add small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Restore original submit
      this.form.submit = originalSubmit;

      // Calculate final metrics
      this.results.averageLoadTime = this.results.totalTestTime / this.results.testIterations;
      this.results.errorRate = Object.values(this.results.fieldResults).reduce(
        (total, field) => total + field.errorCount,
        0
      ) / (this.results.testIterations * Object.keys(this.results.fieldResults).length);

      return this.results;
    } finally {
      this.isRunning = false;
    }
  }

  public stopTests(): void {
    this.isRunning = false;
  }

  public getResults(): PerformanceTestResult {
    return { ...this.results };
  }

  public async generateReport(): Promise<string> {
    const results = this.getResults();
    const report = [
      '# Form Performance Test Report',
      '',
      `Form ID: ${this.config.formId}`,
      `Test Iterations: ${results.testIterations}`,
      `Total Test Time: ${results.totalTestTime.toFixed(2)}ms`,
      '',
      '## Average Metrics',
      `- Load Time: ${results.averageLoadTime.toFixed(2)}ms`,
      `- Interaction Time: ${results.averageInteractionTime.toFixed(2)}ms`,
      `- Submission Time: ${results.averageSubmissionTime.toFixed(2)}ms`,
      `- Validation Time: ${results.averageValidationTime.toFixed(2)}ms`,
      `- Error Rate: ${(results.errorRate * 100).toFixed(1)}%`,
      '',
      '## Field Results',
      ...Object.entries(results.fieldResults).map(([field, metrics]) => [
        `### ${field}`,
        `- Average Input Time: ${metrics.averageInputTime.toFixed(2)}ms`,
        `- Error Count: ${metrics.errorCount}`,
        `- Validation Time: ${metrics.validationTime.toFixed(2)}ms`,
      ]).flat(),
    ].join('\n');

    return report;
  }
}

export default FormPerformanceTester;