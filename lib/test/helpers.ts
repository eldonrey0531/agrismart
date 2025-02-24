import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test wrapper types
interface WrapperProps {
  children: ReactNode;
}

// Mock data types
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface MockProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

// Common test data
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'A test product description',
    imageUrl: '/images/test-product.jpg',
  },
  {
    id: '2',
    name: 'Another Product',
    price: 149.99,
    description: 'Another test product description',
    imageUrl: '/images/another-product.jpg',
  },
];

// Custom render function
function customRender(ui: React.ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: ({ children }: WrapperProps) => children,
      ...options,
    }),
  };
}

// Mock API response helper
export function createMockApiResponse<T>(data: T, status = 200, ok = true) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    headers: new Map(),
  };
}

// Wait helper (useful for animations/transitions)
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock console methods while preserving errors
export function mockConsole() {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.log = original.log;
    console.error = original.error;
    console.warn = original.warn;
  });
}

// Generate mock events
export const createMockEvent = (type: string, props = {}) => {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    type,
    ...props,
  };
};

// Mock localStorage
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    length: Object.keys(storage).length,
    key: (index: number) => Object.keys(storage)[index],
  };
}

// Create async error for testing error boundaries
export function createAsyncError(message: string) {
  return Promise.reject(new Error(message));
}

// Mock IntersectionObserver entries
export function createMockIntersectionObserverEntry(
  isIntersecting: boolean,
  ratio = 0
) {
  return {
    isIntersecting,
    intersectionRatio: ratio,
    boundingClientRect: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
    },
  };
}

export {
  customRender as render,
  userEvent,
};

export * from '@testing-library/react';
export type { MockUser, MockProduct };