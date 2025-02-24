/// <reference types="vitest/globals" />

interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R;
  toBeValidMongoId(): R;
  toBeValidResponse(): R;
  toHaveErrorType(type: string): R;
  toHaveSuccessMessage(message: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

const customMatchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => 
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },

  toBeValidMongoId(received: string) {
    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
    const pass = mongoIdPattern.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid MongoDB ObjectId`
          : `expected ${received} to be a valid MongoDB ObjectId`,
    };
  },

  toBeValidResponse(received: any) {
    const pass = 
      received &&
      typeof received === 'object' &&
      'success' in received;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${JSON.stringify(received)} not to be a valid API response`
          : `expected ${JSON.stringify(received)} to be a valid API response`,
    };
  },

  toHaveErrorType(received: any, type: string) {
    const pass = 
      received &&
      typeof received === 'object' &&
      'error' in received &&
      received.error === type;
    return {
      pass,
      message: () =>
        pass
          ? `expected error type not to be "${type}"`
          : `expected error type to be "${type}"`,
    };
  },

  toHaveSuccessMessage(received: any, message: string) {
    const pass = 
      received &&
      typeof received === 'object' &&
      'success' in received &&
      received.success === true &&
      'message' in received &&
      received.message === message;
    return {
      pass,
      message: () =>
        pass
          ? `expected success message not to be "${message}"`
          : `expected success message to be "${message}"`,
    };
  },
};

// Register custom matchers
expect.extend(customMatchers);

export default customMatchers;