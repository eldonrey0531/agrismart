/// <reference types="vitest/globals" />
import type { Mock } from 'vitest';

declare global {
  export const describe: typeof import('vitest')['describe'];
  export const test: typeof import('vitest')['test'];
  export const it: typeof import('vitest')['it'];
  export const expect: typeof import('vitest')['expect'];
  export const vi: typeof import('vitest')['vi'];
  export const beforeAll: typeof import('vitest')['beforeAll'];
  export const afterAll: typeof import('vitest')['afterAll'];
  export const beforeEach: typeof import('vitest')['beforeEach'];
  export const afterEach: typeof import('vitest')['afterEach'];
}

declare module 'vitest' {
  interface TestContext {
    testUtils: typeof import('../__tests__/setup').testUtils;
  }
}

// Extend Vitest declarations
declare module 'vitest' {
  export interface MockInstance<T, Y extends any[]> extends Mock<T, Y> {}
  
  export interface MockContext {
    calls: any[][];
    instances: any[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
  }
  
  export interface SpyInstance<T = any, Y extends any[] = any[]> extends Mock<T, Y> {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
  }
  
  export interface Mock<T = any, Y extends any[] = any[]> {
    (this: any, ...args: Y): T;
    _isMockFunction: true;
    getMockImplementation(): ((...args: Y) => T) | undefined;
    getMockName(): string;
    mock: MockContext;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    mockImplementation(fn: ((...args: Y) => T)): this;
    mockImplementationOnce(fn: ((...args: Y) => T)): this;
    mockName(name: string): this;
    mockReturnThis(): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue(value: Awaited<T>): this;
    mockResolvedValueOnce(value: Awaited<T>): this;
    mockRejectedValue(value: unknown): this;
    mockRejectedValueOnce(value: unknown): this;
  }
}

export {};