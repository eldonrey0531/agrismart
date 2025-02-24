import '@testing-library/jest-dom';
import { matchers } from './matchers';
import { dbTestUtils } from './mock-db';
import { expressTestUtils } from './mock-express';
import { testUtils } from './utils';
import { mockUtils } from './mock-utils';
import { prismaMock, resetPrismaMocks } from './mock-prisma';
import type { TestEnvironmentOptions, TestSetupResult, TestUtilities } from './test-types';

/**
 * Initialize test environment
 */
beforeAll(() => {
  // Add custom matchers
  expect.extend(matchers);

  // Mock console methods
  mockUtils.mockConsole();
});

/**
 * Reset test state
 */
beforeEach(() => {
  // Set fixed date
  jest.setSystemTime(new Date('2025-01-01'));
  
  // Reset mocks
  jest.clearAllMocks();
  resetPrismaMocks(prismaMock);
});

/**
 * Cleanup test environment
 */
afterEach(() => {
  jest.useRealTimers();
});

/**
 * Test environment utilities
 */
export const setupTest: TestUtilities['setup'] = {
  /**
   * Create test environment
   */
  create: (options: TestEnvironmentOptions = {}): TestSetupResult => {
    const cleanup: Array<() => void> = [];

    // Mock date
    if (options.mockDate) {
      cleanup.push(mockUtils.mockDate(options.mockDate));
    }

    // Mock environment variables
    if (options.mockEnv) {
      cleanup.push(mockUtils.mockEnv(options.mockEnv));
    }

    return {
      prisma: prismaMock,
      db: dbTestUtils,
      express: expressTestUtils,
      utils: testUtils,
      cleanup: () => cleanup.forEach(fn => fn()),
    };
  },

  /**
   * Reset test environment
   */
  reset: () => {
    jest.resetModules();
    jest.clearAllMocks();
    resetPrismaMocks(prismaMock);
  },

  /**
   * Create mock environment variables
   */
  mockEnv: mockUtils.mockEnv,
};

// Export module types
export type { TestRequest } from './test-types';
export type { CustomMatcherResult } from './types/matchers';

// Export utilities
export {
  /**
   * Database test utilities
   */
  dbTestUtils,

  /**
   * Express test utilities
   */
  expressTestUtils,

  /**
   * General test utilities
   */
  testUtils,

  /**
   * Custom matchers
   */
  matchers,

  /**
   * Mock utilities
   */
  mockUtils,

  /**
   * Prisma mock
   */
  prismaMock,
};

export default setupTest;