import { type RenderOptions, render } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

// Extend vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

// Mock Media Query
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

function createMatchMedia(matches: boolean) {
  return (query: string): MockMediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

// Mock window.matchMedia
function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMedia(matches),
  });
}

// Color utilities for testing
function parseColor(color: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.fillStyle = color;
  const computed = ctx.fillStyle;
  
  // Format: #RRGGBB
  const r = parseInt(computed.slice(1, 3), 16);
  const g = parseInt(computed.slice(3, 5), 16);
  const b = parseInt(computed.slice(5, 7), 16);
  
  return { r, g, b };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${[r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

// Mock resize observer
class ResizeObserverMock implements ResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  
  observe(target: Element, options?: ResizeObserverOptions): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
}

function mockResizeObserver() {
  window.ResizeObserver = ResizeObserverMock;
}

// Mock intersection observer
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(private callback: IntersectionObserverCallback) {}
  
  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function mockIntersectionObserver() {
  window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
}

// Mock RAF and CAF
function mockRequestAnimationFrame() {
  let id = 0;
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    const timeoutId = setTimeout(() => callback(Date.now()), 0);
    return id++;
  };
  window.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

// Test Utils export
export {
  customRender as render,
  mockMatchMedia,
  mockResizeObserver,
  mockIntersectionObserver,
  mockRequestAnimationFrame,
  parseColor,
  rgbToHex,
};

// Re-export everything from testing-library
export * from '@testing-library/react';