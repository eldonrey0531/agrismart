# Test Utilities Documentation

This document describes the test utilities and helpers available for writing API tests.

## Quick Start

```typescript
import { describe, it, expect } from '@jest/globals';
import createTestHelper from './test-helpers';
import { api } from './api-builder';
import { HttpUtils } from './http-utils';
import { ErrorUtils } from './test-errors';
import TEST_CONFIG from './test-config';

describe('API Test Example', () => {
  const helper = createTestHelper();

  beforeEach(() => {
    helper.setup({ name: 'example-test' });
  });

  afterEach(() => {
    helper.cleanup();
  });

  it('demonstrates basic test pattern', async () => {
    // Arrange
    helper.mockSuccess({ message: 'Success' });

    // Act
    const response = await fetch(
      api.auth.login({
        email: 'test@example.com',
        password: 'password123',
      }).build()
    );

    // Assert
    await HttpUtils.assert.assertSuccess(response);
  });
});
```

## Test Utilities

### Test Helper (`test-helpers.ts`)
- Handles test setup and cleanup
- Manages mock responses
- Controls rate limiting
- Provides test lifecycle hooks

```typescript
const helper = createTestHelper();

// Setup with options
helper.setup({
  name: 'test-name',
  timeout: 5000,
  headers: { 'Custom-Header': 'value' },
});

// Mock responses
helper.mockSuccess(data);
helper.mockError(ErrorUtils.factory.invalidCredentials());

// Rate limiting
helper.useRateLimit();
await helper.waitForRateLimit();
```

### API Builder (`api-builder.ts`)
- Builds API requests
- Provides type-safe endpoints
- Handles auth tokens
- Manages request configuration

```typescript
// Create login request
api.auth.login({
  email: 'user@example.com',
  password: 'password123',
}).build();

// Create authenticated request
api.users.profile()
  .auth(token)
  .query({ include: 'settings' })
  .build();
```

### HTTP Utilities (`http-utils.ts`)
- Provides request building
- Handles response assertions
- Manages headers
- Validates responses

```typescript
// Assert successful response
await HttpUtils.assert.assertSuccess(response, expectedData);

// Assert error response
await HttpUtils.assert.assertError(response, {
  type: ErrorUtils.type.VALIDATION,
  message: 'Invalid input',
  status: HttpUtils.status.BAD_REQUEST,
});

// Assert headers
HttpUtils.assert.assertHeaders(response, expectedHeaders);
```

### Error Utilities (`test-errors.ts`)
- Provides error factories
- Manages error types
- Handles error validation
- Standardizes error responses

```typescript
// Create validation error
ErrorUtils.factory.validation('email', 'Invalid email format');

// Create auth error
ErrorUtils.factory.invalidCredentials();

// Create rate limit error
ErrorUtils.factory.rateLimit(retryAfter);

// Check error types
ErrorUtils.is.validation(error);
ErrorUtils.is.authentication(error);
```

## Best Practices

1. **Test Setup**
   - Use `beforeEach` for consistent setup
   - Clean up after each test
   - Use meaningful test names

2. **Request Building**
   - Use the API builder for requests
   - Set proper headers and auth
   - Handle query parameters

3. **Response Assertions**
   - Use proper assertion helpers
   - Check response status and data
   - Validate error responses

4. **Error Handling**
   - Use error factories
   - Check proper error types
   - Validate error messages

5. **Rate Limiting**
   - Test rate limit enforcement
   - Handle rate limit resets
   - Validate retry headers

## Common Patterns

### Testing Successful Responses
```typescript
it('handles successful request', async () => {
  helper.mockSuccess(expectedData);
  const response = await fetch(api.auth.login(credentials).build());
  await HttpUtils.assert.assertSuccess(response, expectedData);
});
```

### Testing Error Responses
```typescript
it('handles error cases', async () => {
  helper.mockError(ErrorUtils.factory.validation('field', 'message'));
  const response = await fetch(api.auth.login(invalidData).build());
  await HttpUtils.assert.assertError(response, {
    type: ErrorUtils.type.VALIDATION,
    message: 'Invalid input',
    status: HttpUtils.status.BAD_REQUEST,
  });
});
```

### Testing Rate Limits
```typescript
it('enforces rate limits', async () => {
  // Make requests until limit
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(request);
    const limits = helper.getRateLimits();
    expect(limits.remaining).toBe(maxAttempts - i - 1);
  }

  // Test limit exceeded
  const blockedResponse = await fetch(request);
  await HttpUtils.assert.assertError(blockedResponse, {
    type: ErrorUtils.type.RATE_LIMIT,
    status: HttpUtils.status.TOO_MANY_REQUESTS,
  });
});
```

## Configuration

See `test-config.ts` for available configuration options including:
- API endpoints
- Rate limiting settings
- Default test data
- Error messages
- Security headers