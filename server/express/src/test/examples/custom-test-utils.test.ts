import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import path from 'path';
import { setupUtils, type SetupUtility } from './setup-test-utils';
import { updateUtils, type UpdateUtility } from './update-test-utils';
import { CliLogger as Log } from './cli-logger';
import config from './setup-config.json';
import {
  TestHelper,
  TEST_ENV,
  TestFileSystem,
  TestAssertions,
  type ValidationResult,
  type TestResult,
} from './test-shared';

/**
 * Custom Setup Utility with Logging
 */
class LoggingSetupUtility implements SetupUtility {
  #baseSetup: SetupUtility;
  #logFile: string;
  #helper: TestHelper;

  constructor(baseSetup: SetupUtility, logFile: string) {
    this.#baseSetup = baseSetup;
    this.#logFile = logFile;
    this.#helper = new TestHelper();
  }

  async beforeSetup(options: Parameters<SetupUtility['setup']>[0]): Promise<void> {
    await this.#helper.setup();
    await TestFileSystem.appendLog(this.#logFile, 'Starting setup...');
    Log.info('Setting up with options: ' + JSON.stringify(options, null, 2));
  }

  async setup(options: Parameters<SetupUtility['setup']>[0]): Promise<void> {
    const result = await this.#helper.runTest('setup', () =>
      this.#baseSetup.setup(options)
    );

    if (!TestAssertions.isSuccess(result)) {
      throw result.error;
    }
  }

  async afterSetup(_options: Parameters<SetupUtility['setup']>[0]): Promise<void> {
    await TestFileSystem.appendLog(this.#logFile, 'Setup completed successfully.');
    Log.success('Setup completed');
    await this.#helper.cleanup();
  }

  async getResults(): Promise<TestResult[]> {
    return this.#helper.results.getResults();
  }
}

/**
 * Custom Update Utility with Validation
 */
class ValidatingUpdateUtility implements UpdateUtility {
  #baseUpdate: UpdateUtility;
  #helper: TestHelper;
  #validations: ValidationResult[] = [];

  constructor(baseUpdate: UpdateUtility) {
    this.#baseUpdate = baseUpdate;
    this.#helper = new TestHelper();
  }

  async #validateFiles(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const utilsDir = path.join(process.cwd(), config.directories.utils);

    for (const file of config.files.required) {
      const filePath = path.join(utilsDir, file);
      try {
        await TestAssertions.assertFileExists(filePath);
        results.push({
          file,
          exists: true,
          timestamp: new Date(),
        });
        Log.success(`✓ ${file} exists`);
      } catch {
        const result = {
          file,
          exists: false,
          timestamp: new Date(),
        };
        results.push(result);
        throw new Error(`Required file missing: ${file}`);
      }
    }

    return results;
  }

  async beforeUpdate(options: Parameters<UpdateUtility['update']>[0]): Promise<void> {
    await this.#helper.setup();
    Log.info('Starting update with validation...');
    this.#validations = await this.#validateFiles();
  }

  async update(options: Parameters<UpdateUtility['update']>[0]): Promise<void> {
    const result = await this.#helper.runTest('update', () =>
      this.#baseUpdate.update(options)
    );

    if (!TestAssertions.isSuccess(result)) {
      throw result.error;
    }
  }

  async afterUpdate(_options: Parameters<UpdateUtility['update']>[0]): Promise<void> {
    const validations = await this.#validateFiles();
    this.#validations.push(...validations);
    Log.success('Update completed with validation');
    await this.#helper.cleanup();
  }

  getValidationResults(): ValidationResult[] {
    return [...this.#validations];
  }
}

describe('Custom Test Utilities', () => {
  const testFile = TEST_ENV.files.setup;
  let helper: TestHelper;

  beforeEach(async () => {
    helper = new TestHelper();
    await helper.setup();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  describe('LoggingSetupUtility', () => {
    it('logs setup operations', async () => {
      // Arrange
      const loggingSetup = new LoggingSetupUtility(setupUtils, testFile);
      
      // Act
      await loggingSetup.setup({
        includeExamples: true,
        includeDocs: true,
      });

      // Assert
      await TestAssertions.assertLogContains(testFile, 'Starting setup...');
      await TestAssertions.assertLogContains(testFile, 'Setup completed successfully.');

      const results = await loggingSetup.getResults();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => TestAssertions.isSuccess(r))).toBe(true);
    });

    it('handles setup failures', async () => {
      // Arrange
      const failingSetup: SetupUtility = {
        async setup() {
          throw new Error('Setup failed');
        },
      };
      const loggingSetup = new LoggingSetupUtility(failingSetup, testFile);

      // Act & Assert
      await expect(loggingSetup.setup({})).rejects.toThrow('Setup failed');
    });
  });

  describe('ValidatingUpdateUtility', () => {
    it('validates files before and after update', async () => {
      // Arrange
      const validatingUpdate = new ValidatingUpdateUtility(updateUtils);
      
      // First ensure files exist
      await setupUtils.setup({
        includeExamples: true,
        includeDocs: true,
      });

      // Act
      await validatingUpdate.update({
        force: true,
        backup: true,
      });

      // Assert
      const results = validatingUpdate.getValidationResults();
      expect(results.every(r => r.exists)).toBe(true);
    });

    it('throws error if required files are missing', async () => {
      // Arrange
      const validatingUpdate = new ValidatingUpdateUtility(updateUtils);
      
      // Act & Assert
      await expect(
        validatingUpdate.update({
          force: true,
          backup: false,
        })
      ).rejects.toThrow('Required file missing');

      const results = validatingUpdate.getValidationResults();
      expect(results.some(r => !r.exists)).toBe(true);
    });
  });

  describe('Combined Utilities', () => {
    it('can be chained together', async () => {
      // Arrange
      const loggingSetup = new LoggingSetupUtility(setupUtils, testFile);
      const validatingUpdate = new ValidatingUpdateUtility(updateUtils);

      // Act
      await loggingSetup.setup({
        includeExamples: true,
        includeDocs: true,
      });

      await validatingUpdate.update({
        force: true,
        backup: true,
      });

      // Assert
      await TestAssertions.assertLogContains(testFile, 'Starting setup...');
      await TestAssertions.assertLogContains(testFile, 'Setup completed successfully.');

      const validationResults = validatingUpdate.getValidationResults();
      expect(validationResults.every(r => r.exists)).toBe(true);
    });
  });
});