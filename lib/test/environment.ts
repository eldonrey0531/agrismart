import '@testing-library/jest-dom/vitest';
import { expect, beforeAll, afterEach, afterAll, vi, type MockInstance } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  mockMatchMedia,
  mockResizeObserver,
  mockIntersectionObserver,
  mockRequestAnimationFrame,
} from './utils';

// Store original implementations
const originalMatchMedia = window.matchMedia;
const originalResizeObserver = window.ResizeObserver;
const originalIntersectionObserver = window.IntersectionObserver;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

// Custom matcher types
interface CustomMatchers<R = unknown> {
  toHaveBeenCalledBefore(mock: MockInstance): R;
}

declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Setup all mocks before tests
beforeAll(() => {
  // Mock all browser APIs
  mockMatchMedia();
  mockResizeObserver();
  mockIntersectionObserver();
  mockRequestAnimationFrame();

  // Mock console methods to catch warnings/errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = vi.fn((...args: any[]) => {
    const message = args.join(' ');
    // Ignore specific React warnings if needed
    if (
      message.includes('React does not recognize the') ||
      message.includes('Invalid DOM property')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  });

  console.warn = vi.fn((...args: any[]) => {
    const message = args.join(' ');
    // Ignore specific warnings if needed
    if (message.includes('componentWillReceiveProps')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  });

  // Store console mocks for cleanup
  vi.stubGlobal('console', console);
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Restore original implementations after all tests
afterAll(() => {
  // Restore browser APIs
  window.matchMedia = originalMatchMedia;
  window.ResizeObserver = originalResizeObserver;
  window.IntersectionObserver = originalIntersectionObserver;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.cancelAnimationFrame = originalCancelAnimationFrame;

  // Restore console
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

// Add custom matchers
expect.extend({
  toHaveBeenCalledBefore(received: unknown, expected: unknown) {
    const isReceivedMock = vi.isMockFunction(received);
    const isExpectedMock = vi.isMockFunction(expected);

    if (!isReceivedMock || !isExpectedMock) {
      return {
        message: () => 'Both arguments must be mock functions',
        pass: false,
      };
    }

    const receivedMock = received as MockInstance;
    const expectedMock = expected as MockInstance;

    if (!receivedMock.mock || !expectedMock.mock) {
      return {
        message: () => 'Both arguments must be Vitest mock functions',
        pass: false,
      };
    }

    const receivedCalls = receivedMock.mock.invocationCallOrder ?? [];
    const expectedCalls = expectedMock.mock.invocationCallOrder ?? [];

    if (
      receivedCalls.length === 0 ||
      expectedCalls.length === 0 ||
      Math.min(...receivedCalls) >= Math.min(...expectedCalls)
    ) {
      return {
        message: () =>
          `expected first mock to have been called before second mock`,
        pass: false,
      };
    }

    return {
      message: () =>
        `expected first mock not to have been called before second mock`,
      pass: true,
    };
  },
});

// Export test utilities
export * from './utils';
export { expect };