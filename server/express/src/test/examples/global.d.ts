import type { TestUtils } from './test-types';

declare global {
  // eslint-disable-next-line no-var
  var __TEST_UTILS__: TestUtils;
}

// This export is needed to make this a module
export {};