import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TimingUtils, TIMING } from './timing-utils';
import { api } from './api-builder';
import { HttpUtils } from './http-utils';
import { ErrorUtils } from './test-errors';
import TEST_CONFIG from './test-config';

describe('Timing Utilities Example', () => {
  beforeEach(() => {
    TimingUtils.timers.mock();
  });

  afterEach(() => {
    TimingUtils.timers.restore();
  });

  describe('Rate Limiting', () => {
    it('handles rate limit recovery', async () => {
      // Arrange
      const rateLimitDuration = TEST_CONFIG.rateLimiting.blockDuration;
      TimingUtils.dateTime.mockNow(Date.now());

      // Make requests until rate limited
      for (let i = 0; i < TEST_CONFIG.rateLimiting.maxAttempts; i++) {
        const response = await fetch(api.auth.login().build());
        expect(response.status).toBe(401);
      }

      // Verify rate limit
      const blockedResponse = await fetch(api.auth.login().build());
      expect(blockedResponse.status).toBe(429);

      // Advance time past rate limit
      TimingUtils.dateTime.advance(rateLimitDuration);

      // Should work again
      const response = await fetch(api.auth.login().build());
      expect(response.status).not.toBe(429);
    });
  });

  describe('Request Timeouts', () => {
    it('handles request timeout', async () => {
      // Arrange
      const slowOperation = () => new Promise(resolve => {
        setTimeout(resolve, TIMING.timeout.request * 2);
      });

      // Act & Assert
      await expect(
        TimingUtils.withTimeout(slowOperation, TIMING.timeout.request)
      ).rejects.toThrow('Operation timed out');
    });

    it('completes within timeout', async () => {
      // Arrange
      const fastOperation = () => Promise.resolve('success');

      // Act
      const result = await TimingUtils.withTimeout(
        fastOperation,
        TIMING.timeout.request
      );

      // Assert
      expect(result).toBe('success');
    });
  });

  describe('Polling', () => {
    it('waits for condition', async () => {
      // Arrange
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 3;
      };

      // Act
      await TimingUtils.waitFor(condition, {
        interval: TIMING.interval.polling,
        timeout: TIMING.timeout.test,
      });

      // Assert
      expect(counter).toBe(3);
    });

    it('handles timeout when condition not met', async () => {
      // Arrange
      const condition = () => false;

      // Act & Assert
      await expect(
        TimingUtils.waitFor(condition, {
          timeout: TIMING.delay.short,
          message: 'Custom timeout message',
        })
      ).rejects.toThrow('Custom timeout message');
    });
  });

  describe('Async Operations', () => {
    it('handles multiple async operations', async () => {
      // Arrange
      const operations = [
        TimingUtils.wait(TIMING.delay.short),
        TimingUtils.wait(TIMING.delay.medium),
        TimingUtils.wait(TIMING.delay.long),
      ];

      // Act
      const startTime = Date.now();
      await Promise.all(operations);
      TimingUtils.timers.runAll();
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeGreaterThanOrEqual(TIMING.delay.long);
    });

    it('processes events in correct order', async () => {
      // Arrange
      const events: number[] = [];

      // Act
      setTimeout(() => events.push(3), TIMING.delay.long);
      setTimeout(() => events.push(2), TIMING.delay.medium);
      setTimeout(() => events.push(1), TIMING.delay.short);

      // Run all timers
      TimingUtils.timers.runAll();

      // Assert
      expect(events).toEqual([1, 2, 3]);
    });
  });

  describe('Date Mocking', () => {
    it('mocks current date', () => {
      // Arrange
      const mockDate = new Date('2025-01-01');
      TimingUtils.dateTime.mockNow(mockDate);

      // Act
      const now = Date.now();

      // Assert
      expect(now).toBe(mockDate.getTime());
    });

    it('advances time', () => {
      // Arrange
      const startDate = new Date('2025-01-01').getTime();
      TimingUtils.dateTime.mockNow(startDate);

      // Act
      TimingUtils.dateTime.advance(TIMING.delay.long);

      // Assert
      expect(Date.now()).toBe(startDate + TIMING.delay.long);
    });
  });
});