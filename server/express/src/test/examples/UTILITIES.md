# Test Utilities Guide

A comprehensive guide to using the test utilities for API testing.

## Core Utilities

### 1. Test Helper (`test-helpers.ts`)

```typescript
const helper = createTestHelper();

// Setup
helper.setup({
  name: 'test-name',
  timeout: 5000,
  headers: { 'Custom': 'value' },
});

// Mock responses
helper.mockSuccess({ data: 'example' });
helper.mockError(ErrorUtils.factory.unauthorized('invalidToken'));
```

**When to use:**
- Setting up test environment
- Mocking responses
- Managing rate limits
- Handling headers

### 2. API Builder (`api-builder.ts`)

```typescript
// Create requests
api.auth.login(credentials).build();
api.users.profile()
  .auth(token)
  .query({ include: 'settings' })
  .build();
```

**When to use:**
- Building API requests
- Adding auth tokens
- Setting query parameters
- Creating consistent endpoints

### 3. HTTP Utilities (`http-utils.ts`)

```typescript
// Assert responses
await HttpUtils.assert.assertSuccess(response, expectedData);
await HttpUtils.assert.assertError(response, {
  type: ErrorUtils.type.VALIDATION,
  status: HttpUtils.status.BAD_REQUEST,
});
```

**When to use:**
- Asserting response status
- Checking response data
- Validating headers
- Testing error cases

### 4. Error Utilities (`test-errors.ts`)

```typescript
// Create errors
ErrorUtils.factory.validation('email', 'Invalid format');
ErrorUtils.factory.unauthorized('sessionExpired');
ErrorUtils.factory.network('connectionFailed');
```

**When to use:**
- Creating error responses
- Type-safe error messages
- Consistent error handling
- Validating error types

### 5. Timing Utilities (`timing-utils.ts`)

```typescript
// Control time
TimingUtils.timers.mock();
TimingUtils.dateTime.mockNow(new Date());
await TimingUtils.wait(1000);
await TimingUtils.waitFor(condition);
```

**When to use:**
- Mocking timers
- Testing timeouts
- Handling async operations
- Managing delays

## Common Testing Patterns

### 1. Authentication Testing

```typescript
it('tests auth flow', async () => {
  // Login
  helper.mockSuccess({ token: 'valid-token' });
  const response = await fetch(api.auth.login(credentials).build());
  const { token } = await HttpUtils.assert.assertSuccess(response);

  // Use token
  helper.mockSuccess({ data: 'protected' });
  const protectedResponse = await fetch(
    api.users.profile()
      .auth(token)
      .build()
  );
  await HttpUtils.assert.assertSuccess(protectedResponse);
});
```

### 2. Rate Limiting

```typescript
it('handles rate limits', async () => {
  // Exceed limit
  helper.mockError(ErrorUtils.factory.rateLimit(30));
  const response = await fetch(request);
  await HttpUtils.assert.assertError(response, {
    type: ErrorUtils.type.RATE_LIMIT,
    status: HttpUtils.status.TOO_MANY_REQUESTS,
  });

  // Wait for reset
  await helper.waitForRateLimit();
});
```

### 3. Error Recovery

```typescript
it('handles transient errors', async () => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      helper.mockError(ErrorUtils.factory.network('connectionFailed'));
      await fetch(request);
    } catch (error) {
      attempts++;
      await TimingUtils.wait(backoffTime);
    }
  }
});
```

## Best Practices

### 1. Test Setup

- Use `beforeEach` for consistent setup
- Clean up after each test
- Mock responses appropriately
- Use type-safe utilities

```typescript
beforeEach(() => {
  helper.setup({ name: 'test-suite' });
  TimingUtils.timers.mock();
});

afterEach(() => {
  helper.cleanup();
  TimingUtils.timers.restore();
});
```

### 2. Response Assertions

- Use provided assertion helpers
- Check specific conditions
- Validate error scenarios
- Verify response data

```typescript
// Success case
await HttpUtils.assert.assertSuccess(response, expectedData);

// Error case
await HttpUtils.assert.assertError(response, {
  type: ErrorUtils.type.VALIDATION,
  status: HttpUtils.status.BAD_REQUEST,
});
```

### 3. User Management

- Use `createDefaultUser` for test users
- Override specific properties
- Maintain type safety

```typescript
const testUser = createDefaultUser({
  id: '2',
  email: 'test@example.com',
  name: 'Test User',
});
```

### 4. Error Handling

- Use error factories
- Provide specific messages
- Check error types
- Validate status codes

```typescript
helper.mockError(
  ErrorUtils.factory.unauthorized('sessionExpired')
);
```

### 5. Timing Control

- Mock timers when needed
- Handle async operations
- Use proper delays
- Manage rate limits

```typescript
TimingUtils.timers.mock();
TimingUtils.dateTime.mockNow(new Date());
await TimingUtils.wait(1000);
TimingUtils.timers.restore();
```

## Tips and Tricks

1. **Type Safety**
   - Use provided interfaces
   - Let TypeScript infer types
   - Add explicit types when needed

2. **Response Mocking**
   - Mock minimal data
   - Use factories
   - Keep tests focused

3. **Error Testing**
   - Test common errors
   - Validate messages
   - Check recovery

4. **Performance**
   - Mock timers
   - Avoid real delays
   - Use proper timeouts

5. **Maintenance**
   - Follow patterns
   - Use utilities
   - Keep tests clean

## Further Reading

- [Test Documentation](./TEST.md)
- [Setup Guide](./SETUP.md)
- [Example Tests](./auth.example.test.ts)
- [Advanced Examples](./advanced.example.test.ts)