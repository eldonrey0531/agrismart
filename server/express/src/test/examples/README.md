# Test Utilities Documentation

A comprehensive testing utilities suite for API testing with TypeScript and Jest.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Core Utilities](#core-utilities)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Installation

```bash
# Install using npm
npm install @your-org/test-utils --save-dev

# Or using yarn
yarn add -D @your-org/test-utils
```

## Basic Usage

```typescript
import { setupUtils, updateUtils } from '@your-org/test-utils';

describe('API Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupUtils.setup({
      includeExamples: true,
      includeDocs: true,
    });
  });

  afterAll(async () => {
    // Update and cleanup
    await updateUtils.update({
      force: true,
      backup: true,
    });
  });

  it('tests something', async () => {
    // Your test here
  });
});
```

## Core Utilities

### TestHelper

The `TestHelper` class provides basic test setup and cleanup functionality:

```typescript
import { TestHelper } from '@your-org/test-utils';

const helper = new TestHelper();

beforeEach(async () => {
  await helper.setup();
});

afterEach(async () => {
  await helper.cleanup();
});
```

### Test Results

Track and validate test results:

```typescript
const result = await helper.runTest('myTest', async () => {
  // Test logic here
  return someData;
});

if (TestAssertions.isSuccess(result)) {
  console.log('Test passed:', result.data);
} else {
  console.error('Test failed:', result.error);
}
```

### File System Utilities

Handle test files and directories:

```typescript
import { TestFileSystem, TEST_ENV } from '@your-org/test-utils';

// Create test directories
await TestFileSystem.createTestDirs();

// Write to log file
await TestFileSystem.appendLog('test.log', 'Test message');

// Read log contents
const logs = await TestFileSystem.readLog('test.log');
```

## Advanced Usage

### Custom Setup Utility

Create a custom setup utility with logging:

```typescript
import { SetupUtility, TestHelper, TestFileSystem } from '@your-org/test-utils';

class LoggingSetupUtility implements SetupUtility {
  #helper = new TestHelper();
  
  async setup(options) {
    await this.#helper.setup();
    await TestFileSystem.appendLog('setup.log', 'Starting setup...');
    
    // Your setup logic here
    
    await TestFileSystem.appendLog('setup.log', 'Setup complete');
  }
}
```

### Custom Validation

Add custom validation to update process:

```typescript
import { UpdateUtility, TestAssertions } from '@your-org/test-utils';

class ValidatingUpdateUtility implements UpdateUtility {
  async update(options) {
    // Pre-update validation
    await TestAssertions.assertDirectoryExists('some/path');
    
    // Update logic here
    
    // Post-update validation
    await TestAssertions.assertLogContains('update.log', 'Success');
  }
}
```

## Best Practices

1. **Use Test Helpers**
   - Always use `TestHelper` for consistent setup/cleanup
   - Leverage built-in utilities instead of custom implementations

2. **Error Handling**
   ```typescript
   try {
     const result = await helper.runTest('test', async () => {
       // Test logic
     });
     
     if (!TestAssertions.isSuccess(result)) {
       throw result.error;
     }
   } catch (error) {
     // Handle error
   }
   ```

3. **Validation**
   - Use `TestAssertions` for consistent checks
   - Create custom assertions when needed
   - Always validate critical operations

4. **Logging**
   - Use structured logging
   - Include timestamps
   - Log both success and failure cases

5. **Clean Up**
   - Always clean up test artifacts
   - Use try/finally blocks
   - Implement proper error handling

## API Reference

### TestHelper

```typescript
class TestHelper {
  setup(): Promise<void>;
  cleanup(): Promise<void>;
  runTest<T>(name: string, test: () => Promise<T>): Promise<TestResult<T>>;
}
```

### TestAssertions

```typescript
class TestAssertions {
  static assertFileExists(path: string): Promise<void>;
  static assertDirectoryExists(path: string): Promise<void>;
  static assertLogContains(file: string, text: string): Promise<void>;
  static isSuccess<T>(result: TestResult<T>): boolean;
  static isError(result: TestResult): boolean;
}
```

### TestFileSystem

```typescript
class TestFileSystem {
  static createTestDirs(): Promise<void>;
  static cleanupTestDirs(): Promise<void>;
  static appendLog(file: string, message: string): Promise<void>;
  static readLog(file: string): Promise<string[]>;
}
```

### Test Results

```typescript
interface TestResultSuccess<T> {
  success: true;
  data: T;
  timestamp: Date;
}

interface TestResultError {
  success: false;
  error: Error;
  timestamp: Date;
}

type TestResult<T = unknown> = TestResultSuccess<T> | TestResultError;
```

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.