/// <reference types="vitest" />

interface CustomMatchers<R = unknown> {
  toBeInRange(min: number, max: number): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}