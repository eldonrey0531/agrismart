# Test Utilities Setup Guide

This guide explains how to set up and configure the test utilities for API testing.

## Installation

1. Install required dependencies:
```bash
npm install --save-dev @jest/globals @types/jest node-fetch
```

2. Configure Jest in `jest.config.ts`:
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/src/test/examples/jest.setup.ts'
  ],
  testMatch: [
    '**/*.test.ts'
  ],
};
```

## Quick Start

1. Create a test file:
```typescript
import { describe, it } from '@jest/globals';
import createTestHelper from './test-helpers';
import { api } from './api-builder';
import { HttpUtils } from './http-utils';

describe('API Test', () => {
  const helper = createTestHelper();

  beforeEach(() => helper.setup());
  afterEach(() => helper.cleanup());

  it('tests an endpoint', async () => {
    // Arrange
    helper.mockSuccess({ data: 'example' });

    // Act
    const response = await fetch(
      api.auth.login({
        email: 'test@example.com',
        password: 'password123'
      }).build()
    );

    // Assert
    await HttpUtils.assert.assertSuccess(response);
  });
});
```

## Test Organization

### 1. Test Helper Setup

```typescript
const helper = createTestHelper();

beforeEach(() => {
  helper.setup({
    name: 'test-name',
    timeout: 5000,
    headers: { 'Custom-Header': 'value' }
  });
});

afterEach(() => {
  helper.cleanup();
});
```

### 2. API Requests

```typescript
// Login request
api.auth.login(credentials).build();

// Authenticated request
api.users.profile()
  .auth(token)
  .query({ include: 'settings' })
  .build();
```

### 3. Response Assertions

```typescript
// Success response
await HttpUtils.assert.assertSuccess(response, expectedData);

// Error response
await HttpUtils.assert.assertError(response, {
  type: ErrorUtils.type.VALIDATION,
  message: 'Invalid input',
  status: HttpUtils.status.BAD_REQUEST
});
```

### 4. Rate Limit Testing

```typescript
// Test rate limiting
const { maxAttempts } = TEST_CONFIG.rateLimiting;

for (let i = 0; i < maxAttempts; i++) {
  const response = await fetch(request);
  const limits = helper.getRateLimits();
  expect(limits?.remaining).toBe(maxAttempts - i - 1);
}

// Test limit exceeded
const blockedResponse = await fetch(request);
await HttpUtils.assert.assertError(blockedResponse, {
  type: ErrorUtils.type.RATE_LIMIT,
  status: HttpUtils.status.TOO_MANY_REQUESTS
});
```

### 5. Timing Control

```typescript
// Use timing utilities
import { TimingUtils } from './timing-utils';

// Mock timers
TimingUtils.timers.mock();

// Wait for condition
await TimingUtils.waitFor(condition, {
  timeout: 5000,
  interval: 100
});

// Run with timeout
const result = await TimingUtils.withTimeout(
  asyncOperation,
  5000
);

// Mock dates
TimingUtils.dateTime.mockNow(new Date('2025-01-01'));
```

## Configuration

### 1. Test Config (`test-config.ts`)
- API endpoints
- Rate limiting settings
- Default test data
- Error messages
- Security headers

### 2. Error Types (`test-errors.ts`)
- Error factories
- Error type constants
- Error utilities
- Status codes

### 3. Response Types (`response-types.ts`)
- Success/error responses
- API-specific types
- Type guards
- Response factories

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive names
   - Follow AAA pattern (Arrange-Act-Assert)

2. **Test Setup**
   - Clean state between tests
   - Use helper functions
   - Mock external dependencies

3. **Assertions**
   - Use provided helpers
   - Check specific conditions
   - Include error cases

4. **Error Handling**
   - Test error scenarios
   - Validate error messages
   - Check status codes

5. **Rate Limiting**
   - Test rate limit enforcement
   - Verify retry behavior
   - Check reset timing

6. **Timing**
   - Mock timers when needed
   - Use timing utilities
   - Handle async operations

## Troubleshooting

1. **Response Type Errors**
   ```typescript
   // Use type assertions
   const data = await HttpUtils.assert.assertSuccess<LoginResponse>(response);
   ```

2. **Rate Limit Issues**
   ```typescript
   // Reset rate limits
   helper.resetRateLimits();
   await helper.waitForRateLimit();
   ```

3. **Timing Problems**
   ```typescript
   // Use timing utilities
   TimingUtils.timers.mock();
   TimingUtils.timers.runAll();
   TimingUtils.timers.restore();
   ```

## Further Reading

- [Test Documentation](./TEST.md)
- [Example Tests](./auth.example.test.ts)
- [Timing Examples](./timing.example.test.ts)