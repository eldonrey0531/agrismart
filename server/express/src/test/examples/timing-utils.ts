import { jest } from '@jest/globals';
import TEST_CONFIG from './test-config';

/**
 * Timing configuration
 */
export const TIMING = {
  /**
   * Default timeout values (ms)
   */
  timeout: {
    test: TEST_CONFIG.api.timeout,
    request: 5000,
    animation: 1000,
    transition: 300,
  },

  /**
   * Default intervals (ms)
   */
  interval: {
    polling: 100,
    refresh: 1000,
    retry: 2000,
  },

  /**
   * Default delays (ms)
   */
  delay: {
    short: 100,
    medium: 500,
    long: 1000,
  },
} as const;

/**
 * Timing utilities
 */
export class TimingUtils {
  /**
   * Wait for specified duration
   */
  static async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for next tick
   */
  static async nextTick(): Promise<void> {
    await new Promise(resolve => process.nextTick(resolve));
  }

  /**
   * Wait for multiple ticks
   */
  static async ticks(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.nextTick();
    }
  }

  /**
   * Wait until condition is met
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      message?: string;
    } = {}
  ): Promise<void> {
    const { 
      timeout = TIMING.timeout.test,
      interval = TIMING.interval.polling,
      message = 'Condition not met within timeout',
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.wait(interval);
    }

    throw new Error(message);
  }

  /**
   * Run with timeout
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeout: number = TIMING.timeout.test
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  }

  /**
   * Timer control
   */
  static timers = {
    /**
     * Use fake timers
     */
    mock() {
      jest.useFakeTimers();
    },

    /**
     * Use real timers
     */
    restore() {
      jest.useRealTimers();
    },

    /**
     * Advance timers
     */
    advance(ms: number) {
      jest.advanceTimersByTime(ms);
    },

    /**
     * Run pending timers
     */
    runPending() {
      jest.runOnlyPendingTimers();
    },

    /**
     * Run all timers
     */
    runAll() {
      jest.runAllTimers();
    },

    /**
     * Clear all timers
     */
    clear() {
      jest.clearAllTimers();
    },
  };

  /**
   * Date/time control
   */
  static dateTime = {
    /**
     * Mock current date
     */
    mockNow(date: Date | number) {
      jest.spyOn(Date, 'now').mockImplementation(() => 
        date instanceof Date ? date.getTime() : date
      );
    },

    /**
     * Advance current date
     */
    advance(ms: number) {
      const current = Date.now();
      this.mockNow(current + ms);
    },

    /**
     * Restore Date.now
     */
    restore() {
      jest.spyOn(Date, 'now').mockRestore();
    },
  };
}

export default TimingUtils;