import { expect } from 'vitest';

// Custom matcher types
interface CustomMatchers<R = unknown> {
  toHaveStyle(style: Record<string, any>): R;
  toBeVisible(): R;
  toBeHidden(): R;
  toHaveBeenCalledBefore(mock: any): R;
  toHaveClassName(className: string): R;
  toHaveAttribute(attr: string, value?: string): R;
}

// Extend Vitest's expect
declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Utility functions
const prettyPrint = (obj: Record<string, any>): string => {
  return JSON.stringify(obj, null, 2);
};

// Style matcher
expect.extend({
  toHaveStyle(received: HTMLElement, expectedStyles: Record<string, any>) {
    const computedStyle = window.getComputedStyle(received);
    const pass = Object.entries(expectedStyles).every(
      ([prop, value]) => computedStyle[prop as any] === value
    );

    return {
      pass,
      message: () => {
        const receivedStyles = Object.fromEntries(
          Object.entries(expectedStyles).map(([prop]) => [
            prop,
            computedStyle[prop as any],
          ])
        );
        return pass
          ? `Expected element not to have styles:\n${prettyPrint(expectedStyles)}\nBut received:\n${prettyPrint(receivedStyles)}`
          : `Expected element to have styles:\n${prettyPrint(expectedStyles)}\nBut received:\n${prettyPrint(receivedStyles)}`;
      },
    };
  },

  // Visibility matchers
  toBeVisible(received: HTMLElement) {
    const computedStyle = window.getComputedStyle(received);
    const isVisible =
      computedStyle.display !== 'none' &&
      computedStyle.visibility !== 'hidden' &&
      computedStyle.opacity !== '0';

    return {
      pass: isVisible,
      message: () =>
        `expected element to be ${isVisible ? 'hidden' : 'visible'}`,
    };
  },

  toBeHidden(received: HTMLElement) {
    const computedStyle = window.getComputedStyle(received);
    const isHidden =
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden' ||
      computedStyle.opacity === '0';

    return {
      pass: isHidden,
      message: () =>
        `expected element to be ${isHidden ? 'visible' : 'hidden'}`,
    };
  },

  // Call order matcher
  toHaveBeenCalledBefore(received: any, other: any) {
    const receivedMock = received.mock;
    const otherMock = other.mock;

    if (!receivedMock || !otherMock) {
      throw new Error('Both arguments must be mock functions');
    }

    const receivedCalls = receivedMock.invocationCallOrder;
    const otherCalls = otherMock.invocationCallOrder;

    if (receivedCalls.length === 0) {
      return {
        pass: false,
        message: () => `Expected mock to have been called at least once`,
      };
    }

    if (otherCalls.length === 0) {
      return {
        pass: false,
        message: () => `Expected comparison mock to have been called at least once`,
      };
    }

    const pass = Math.min(...receivedCalls) < Math.min(...otherCalls);

    return {
      pass,
      message: () =>
        `Expected mock ${pass ? 'not ' : ''}to have been called before comparison mock`,
    };
  },

  // Class name matcher
  toHaveClassName(received: HTMLElement, className: string) {
    const hasClass = received.classList.contains(className);
    return {
      pass: hasClass,
      message: () =>
        `expected element to ${hasClass ? 'not ' : ''}have class "${className}"`,
    };
  },

  // Attribute matcher
  toHaveAttribute(received: HTMLElement, attr: string, value?: string) {
    const hasAttr = received.hasAttribute(attr);
    const attrValue = received.getAttribute(attr);
    const pass = value === undefined ? hasAttr : hasAttr && attrValue === value;

    return {
      pass,
      message: () => {
        if (value === undefined) {
          return `expected element to ${pass ? 'not ' : ''}have attribute "${attr}"`;
        }
        return `expected element to ${
          pass ? 'not ' : ''
        }have attribute "${attr}" with value "${value}"`;
      },
    };
  },
});

// Export types
export type { CustomMatchers };