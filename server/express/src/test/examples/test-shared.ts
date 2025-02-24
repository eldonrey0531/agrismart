import fs from 'fs/promises';
import path from 'path';
import { CliLogger as Log } from './cli-logger';

/**
 * Test Environment Configuration
 */
export const TEST_ENV = {
  dirs: {
    temp: path.join(process.cwd(), 'test-output'),
    logs: path.join(process.cwd(), 'test-output', 'logs'),
    backup: path.join(process.cwd(), 'test-output', 'backup'),
  },
  files: {
    setup: 'setup.log',
    update: 'update.log',
    validation: 'validation.log',
  },
};

/**
 * Test Result Types
 */
export interface ValidationResult {
  file: string;
  exists: boolean;
  timestamp: Date;
}

export interface TestResultSuccess<T> {
  success: true;
  data: T;
  error?: never;
  timestamp: Date;
}

export interface TestResultError {
  success: false;
  data?: never;
  error: Error;
  timestamp: Date;
}

export type TestResult<T = unknown> = TestResultSuccess<T> | TestResultError;

/**
 * File System Utilities
 */
export class TestFileSystem {
  static async createTestDirs(): Promise<void> {
    await Promise.all([
      fs.mkdir(TEST_ENV.dirs.temp, { recursive: true }),
      fs.mkdir(TEST_ENV.dirs.logs, { recursive: true }),
      fs.mkdir(TEST_ENV.dirs.backup, { recursive: true }),
    ]);
  }

  static async cleanupTestDirs(): Promise<void> {
    await fs.rm(TEST_ENV.dirs.temp, { recursive: true, force: true });
  }

  static async appendLog(file: string, message: string): Promise<void> {
    const logPath = path.join(TEST_ENV.dirs.logs, file);
    await fs.appendFile(
      logPath,
      `${new Date().toISOString()} - ${message}\n`
    );
  }

  static async readLog(file: string): Promise<string[]> {
    const logPath = path.join(TEST_ENV.dirs.logs, file);
    try {
      const content = await fs.readFile(logPath, 'utf-8');
      return content.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

/**
 * Test Assertions
 */
export class TestAssertions {
  static async assertFileExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`File does not exist: ${filePath}`);
    }
  }

  static async assertDirectoryExists(dirPath: string): Promise<void> {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${dirPath}`);
      }
    } catch {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
  }

  static async assertLogContains(file: string, expected: string): Promise<void> {
    const logs = await TestFileSystem.readLog(file);
    if (!logs.some(log => log.includes(expected))) {
      throw new Error(`Log does not contain expected message: ${expected}`);
    }
  }

  static isSuccess<T>(result: TestResult<T>): result is TestResultSuccess<T> {
    return result.success;
  }

  static isError(result: TestResult): result is TestResultError {
    return !result.success;
  }
}

/**
 * Test Result Collection
 */
export class TestResults {
  #results: TestResult[] = [];

  addResult(result: TestResult): void {
    this.#results.push(result);
  }

  getResults(): TestResult[] {
    return [...this.#results];
  }

  getSuccessResults<T>(): TestResultSuccess<T>[] {
    return this.#results.filter(TestAssertions.isSuccess) as TestResultSuccess<T>[];
  }

  getErrorResults(): TestResultError[] {
    return this.#results.filter(TestAssertions.isError);
  }

  getSuccessCount(): number {
    return this.getSuccessResults().length;
  }

  getFailureCount(): number {
    return this.getErrorResults().length;
  }

  clear(): void {
    this.#results = [];
  }

  async logResults(file: string): Promise<void> {
    const summary = {
      total: this.#results.length,
      success: this.getSuccessCount(),
      failure: this.getFailureCount(),
      timestamp: new Date(),
    };

    await TestFileSystem.appendLog(file, JSON.stringify(summary, null, 2));
  }
}

/**
 * Test Helper Class
 */
export class TestHelper {
  readonly results = new TestResults();

  async setup(): Promise<void> {
    await TestFileSystem.createTestDirs();
    this.results.clear();
    Log.info('Test environment created');
  }

  async cleanup(): Promise<void> {
    await this.results.logResults('test-summary.log');
    await TestFileSystem.cleanupTestDirs();
    Log.info('Test environment cleaned up');
  }

  async runTest<T>(
    name: string,
    test: () => Promise<T>
  ): Promise<TestResult<T>> {
    const timestamp = new Date();
    
    try {
      const data = await test();
      const result: TestResultSuccess<T> = {
        success: true,
        data,
        timestamp,
      };
      this.results.addResult(result);
      return result;
    } catch (error) {
      const result: TestResultError = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp,
      };
      this.results.addResult(result);
      return result;
    }
  }
}

export default {
  env: TEST_ENV,
  files: TestFileSystem,
  assert: TestAssertions,
  TestHelper,
  TestResults,
};