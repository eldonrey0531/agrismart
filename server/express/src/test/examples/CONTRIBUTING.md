# Contributing to Test Utilities

First off, thank you for considering contributing to our test utilities! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/test-utils.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

1. **Setup Development Environment**
   ```bash
   npm run setup
   ```

2. **Run Tests**
   ```bash
   npm test
   npm run test:watch    # Watch mode
   npm run test:coverage # Coverage report
   ```

3. **Lint Code**
   ```bash
   npm run lint
   npm run lint:fix # Auto-fix issues
   ```

4. **Type Check**
   ```bash
   npm run type-check
   ```

## Pull Request Process

1. **Update Documentation**
   - Add JSDoc comments for new functions/classes
   - Update README.md if needed
   - Add examples for new features

2. **Write Tests**
   - Add unit tests for new functionality
   - Ensure all tests pass
   - Maintain or improve code coverage

3. **Submit PR**
   - Create a Pull Request against main
   - Fill out the PR template
   - Link related issues

4. **Code Review**
   - Address review comments
   - Keep commits atomic
   - Rebase if needed

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function example(param: string): number {
  return param.length;
}

// Use interfaces for complex types
interface Config {
  name: string;
  options: string[];
}

// Use const assertions
const CONFIG = {
  version: '1.0.0',
  env: 'test',
} as const;

// Use private class fields
class Example {
  #privateField: string;
  
  constructor(value: string) {
    this.#privateField = value;
  }
}
```

### Testing

```typescript
describe('Feature', () => {
  // Use descriptive test names
  it('should handle valid input correctly', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
  
  // Group related tests
  describe('error cases', () => {
    it('should handle invalid input', async () => {
      // ...
    });
  });
});
```

### Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Always type check errors
  if (error instanceof Error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
  throw new Error('Unknown error occurred');
}
```

## Testing Guidelines

1. **Test Organization**
   - Group related tests
   - Use descriptive names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Test Coverage**
   - Aim for 80%+ coverage
   - Test edge cases
   - Test error scenarios

3. **Test Types**
   - Unit tests for utilities
   - Integration tests for workflows
   - E2E tests for critical paths

4. **Best Practices**
   - Keep tests focused
   - Don't test implementation details
   - Use test doubles appropriately
   - Clean up test data

## Documentation

1. **Code Comments**
   ```typescript
   /**
    * Processes test results and generates a report
    * @param results - Array of test results
    * @param options - Processing options
    * @returns Formatted report string
    * @throws {Error} If results are invalid
    */
   function processResults(
     results: TestResult[],
     options: ProcessOptions
   ): string {
     // Implementation
   }
   ```

2. **README Updates**
   - Document new features
   - Provide usage examples
   - Update API reference

3. **Changelog**
   - Keep CHANGELOG.md updated
   - Follow semantic versioning
   - Document breaking changes

## Questions?

Feel free to:
- Open an issue
- Ask in discussions
- Contact maintainers

Thank you for contributing! 🎉