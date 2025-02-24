                                                                                                                                                                                                                                                                                           # Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Result collection with type-safe success/error discrimination
- Test helper class with setup/cleanup utilities
- Shared filesystem utilities for test operations
- Assertion utilities with async support
- Structured logging with timestamps
- Custom utility extension support
- Validation result tracking

### Changed
- Improved type safety across all utilities
- Better error handling with specific error types
- Enhanced test organization patterns
- Updated logging format for better readability

## [1.0.0] - 2025-02-15

### Added
- Core test utilities
  - Setup utility with hooks
  - Update utility with validation
  - File system operations
  - Basic logging
- TypeScript support
  - Full type definitions
  - Generic type parameters
  - Type guards
- Test infrastructure
  - Jest integration
  - Async support
  - Error handling
- Documentation
  - README with examples
  - Contributing guidelines
  - API documentation

### Changed
- Restructured project layout
- Improved error messages
- Enhanced type safety
- Better async handling

### Fixed
- File path handling in Windows
- Async cleanup issues
- Type inference problems
- Error propagation

## [0.2.0] - 2025-01-15

### Added
- Basic test helpers
- File system utilities
- Simple logging
- Initial TypeScript support

### Changed
- Improved error handling
- Better async support
- Enhanced documentation

### Deprecated
- Old test helper functions
- Legacy logging methods

### Removed
- Deprecated v0.1.x helpers
- Legacy type definitions

### Fixed
- Async timing issues
- Type definition bugs
- Path resolution problems

## [0.1.0] - 2024-12-15

### Added
- Initial release
- Basic test utilities
- Simple setup/cleanup
- Basic TypeScript definitions

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities

## Upgrade Guide

### Upgrading to 1.0.0

1. **Type Changes**
   ```typescript
   // Old
   type TestResult = {
     success: boolean;
     data?: any;
     error?: Error;
   };

   // New
   type TestResult<T> = 
     | { success: true; data: T; error?: never }
     | { success: false; data?: never; error: Error };
   ```

2. **Setup Utility**
   ```typescript
   // Old
   await setup(options);

   // New
   const setupUtils = new SetupUtility();
   await setupUtils.setup(options);
   ```

3. **Error Handling**
   ```typescript
   // Old
   try {
     await test();
   } catch (e) {
     handleError(e);
   }

   // New
   const result = await helper.runTest('test', test);
   if (!TestAssertions.isSuccess(result)) {
     handleError(result.error);
   }
   ```

### Upgrading to 0.2.0

1. Replace deprecated helpers:
   ```typescript
   // Old
   await oldHelper.setup();

   // New
   await TestHelper.setup();
   ```

2. Update logging:
   ```typescript
   // Old
   log('message');

   // New
   await TestFileSystem.appendLog('test.log', 'message');
   ```

## Versioning Policy

- MAJOR version for incompatible API changes
- MINOR version for backward-compatible features
- PATCH version for backward-compatible fixes

## Support Policy

Each major version is supported for 12 months after its release.

## Issue Reporting

Please report issues via GitHub issues, including:
- Version number
- Full error message
- Minimal reproduction
- Expected behavior