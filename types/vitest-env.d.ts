/// <reference types="vitest" />
/// <reference types="vite/client" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, any> {}
  }
}

interface CustomMatchers<R = unknown> {
  toBeInRange(min: number, max: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}