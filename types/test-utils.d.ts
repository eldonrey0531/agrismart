/// <reference types="vitest" />

import type { MatcherFunction } from '@vitest/expect'

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): void
    toBeValidDate(): void
  }
}

declare global {
  // Extend global with test utilities
  var sleep: (ms: number) => Promise<void>
}