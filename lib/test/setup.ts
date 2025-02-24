/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Types
interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: (listener: () => void) => void;
  removeListener: (listener: () => void) => void;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

interface MockMatchMedia {
  (query: string): MockMediaQueryList;
}

// Mock Implementation
const createMatchMediaMock = (shouldMatch: boolean): MockMatchMedia => {
  return (query: string): MockMediaQueryList => ({
    matches: shouldMatch,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
};

// Set up global mocks before tests
beforeAll(() => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMediaMock(false),
  });
});

// Clean up after each test
afterEach(() => {
  cleanup();
  // Reset matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMediaMock(false),
  });
});

// Test helpers
export const setReducedMotion = (enabled = true): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMediaMock(enabled),
  });
};

export const resetMatchMedia = (): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMediaMock(false),
  });
};

// Test utilities
export const testUtils = {
  setReducedMotion,
  resetMatchMedia,
  createMatchMediaMock,
};