# Testing Documentation

## Structure
```
__tests__/
├── api/            # API endpoint tests
├── unit/           # Unit tests for utilities and models
├── integration/    # Integration tests
├── utils/          # Test utilities and helpers
└── setup.ts        # Test environment setup
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with coverage in watch mode
npm run test:coverage:watch

# Run tests with UI
npm run test:ui
```

## Test Utilities

### `testEndpoint`
Helper function to test API endpoints with consistent patterns:

```typescript
import { testEndpoint } from '../utils/testEndpoint';

test('creates a resource', async () => {
  const { responseData } = await testEndpoint({
    method: 'POST',
    handler: createResource,
    reqBody: { /* request body */ },
    expectedStatus: 201,
    validateData: async (response) => {
      // Custom validation
    }
  });
});
```

### `testPaginatedEndpoint`
Helper for testing paginated endpoints:

```typescript
import { testPaginatedEndpoint } from '../utils/testEndpoint';

test('lists resources with pagination', async () => {
  await testPaginatedEndpoint({
    handler: listResources,
    setupData: async () => {
      // Create test data
    },
    itemsCount: 10,
    pageSize: 5,
    expectedItemShape: {
      id: expect.any(String),
      name: expect.any(String),
    }
  });
});
```

## Conventions

1. **File Naming**
   - Unit tests: `*.test.ts`
   - Integration tests: `*.spec.ts`
   - Test utilities: `*.util.ts`

2. **Test Structure**
   ```typescript
   describe('Component/Feature', () => {
     beforeEach(() => {
       // Setup
     });

     afterEach(() => {
       // Cleanup
     });

     describe('Specific functionality', () => {
       test('should do something', async () => {
         // Test
       });
     });
   });
   ```

3. **Mock Data**
   - Use factories/helpers from `testUtils`
   - Keep mock data close to tests that use them
   - Use realistic-looking test data

4. **Coverage Requirements**
   - Controllers: 90%
   - Services: 90%
   - Models: 85%
   - Utilities: 85%
   - Overall: 80%

## Best Practices

1. **Isolation**
   - Tests should be independent
   - Clean up database after each test
   - Reset mocks between tests

2. **Readability**
   - Use descriptive test names
   - Follow "Arrange-Act-Assert" pattern
   - Group related tests together

3. **Maintainability**
   - Use test utilities and helpers
   - Avoid test code duplication
   - Keep tests focused and concise

4. **Reliability**
   - Avoid flaky tests
   - Handle async operations properly
   - Use stable test selectors/identifiers

## Mocking

1. **Request/Response**
   ```typescript
   import { createMockRequest, createMockResponse } from '../utils/mockRequest';

   const req = createMockRequest({
     body: { /* data */ },
     user: { /* user */ },
   });
   const res = createMockResponse();
   ```

2. **Services**
   ```typescript
   vi.mock('../../services/UserService', () => ({
     default: {
       findById: vi.fn(),
     },
   }));
   ```

## Integration Testing

1. **Database**
   - Uses in-memory MongoDB
   - Fresh database for each test
   - Seeded with test data as needed

2. **External Services**
   - Mock external API calls
   - Use consistent mock responses
   - Test error conditions

## Coverage Reports

Coverage reports are generated in the `coverage` directory:
- `coverage/html/` - HTML report
- `coverage/lcov-report/` - LCOV report
- `coverage/junit.xml` - JUnit report