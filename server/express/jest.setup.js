// This file runs before each test file
process.env.NODE_ENV = 'test';

// Add any global test setup here
beforeAll(() => {
  // Setup code that runs before all tests
});

afterAll(() => {
  // Cleanup code that runs after all tests
});

// Add global mocks if needed
jest.setTimeout(10000); // Set timeout for all tests to 10 seconds

// Suppress console logs during tests unless explicitly enabled
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Enable logs for debugging if needed
if (process.env.DEBUG) {
  global.console = console;
}