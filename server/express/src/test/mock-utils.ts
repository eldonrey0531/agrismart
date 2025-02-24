/**
 * Mock builder utility
 */
class MockBuilder<T extends object> {
  private mock: any = {};

  constructor(template?: Partial<T>) {
    if (template) {
      this.addMethods(template);
    }
  }

  /**
   * Add mock methods from template
   */
  private addMethods(template: object, target: any = this.mock) {
    for (const key of Object.keys(template)) {
      const value = template[key as keyof typeof template];
      if (typeof value === 'function') {
        target[key] = jest.fn();
      } else if (value && typeof value === 'object') {
        target[key] = {};
        this.addMethods(value, target[key]);
      } else {
        target[key] = value;
      }
    }
  }

  /**
   * Add a mock method
   */
  method(name: keyof T, implementation?: (...args: any[]) => any): this {
    this.mock[name] = jest.fn(implementation);
    return this;
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    const resetMocks = (obj: any) => {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (jest.isMockFunction(value)) {
          value.mockReset();
        } else if (value && typeof value === 'object') {
          resetMocks(value);
        }
      }
    };
    resetMocks(this.mock);
  }

  /**
   * Build the mock object
   */
  build(): jest.Mocked<T> {
    return this.mock;
  }
}

/**
 * Create a mock builder
 */
export function createMock<T extends object>(template?: Partial<T>): MockBuilder<T> {
  return new MockBuilder<T>(template);
}

/**
 * Mock environment variables
 */
export function mockEnv(env: Record<string, string>): () => void {
  const oldEnv = process.env;
  process.env = { ...oldEnv, ...env };
  return () => {
    process.env = oldEnv;
  };
}

/**
 * Mock console methods
 */
export function mockConsole(): () => void {
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();

  return () => {
    Object.assign(console, original);
  };
}

/**
 * Mock date utility
 */
export function mockDate(date: Date | string | number): () => void {
  const mockTime = new Date(date).getTime();
  const originalNow = Date.now;
  const originalDate = global.Date;

  global.Date.now = jest.fn(() => mockTime);
  jest.setSystemTime(mockTime);

  return () => {
    global.Date.now = originalNow;
    global.Date = originalDate;
    jest.setSystemTime(originalDate.now());
  };
}

/**
 * Mock builder utilities
 */
export const mockUtils = {
  createMock,
  mockEnv,
  mockConsole,
  mockDate,
};

// Example usage:
// const prismaMock = createMock<PrismaClient>({
//   user: {
//     findUnique: () => Promise.resolve(null),
//     findMany: () => Promise.resolve([]),
//   }
// }).build();

export default mockUtils;