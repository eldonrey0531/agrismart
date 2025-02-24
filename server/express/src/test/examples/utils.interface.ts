/**
 * Base CLI Options
 */
interface BaseCliOptions {
  force?: boolean;
  backup?: boolean;
  deps?: boolean;
  config?: boolean;
}

/**
 * Setup Options
 */
export interface SetupOptions {
  includeExamples?: boolean;
  includeDocs?: boolean;
  installDeps?: boolean;
  setupConfig?: boolean;
}

/**
 * Update Options
 */
export interface UpdateOptions {
  force?: boolean;
  backup?: boolean;
  updateDeps?: boolean;
  updateConfig?: boolean;
}

/**
 * CLI Options
 */
export interface CliOptions extends BaseCliOptions {
  examples?: boolean;
  docs?: boolean;
}

/**
 * Test Utility Functions
 */
export interface TestUtils {
  setup(options: SetupOptions): Promise<void>;
  update(options: UpdateOptions): Promise<void>;
}

/**
 * Spinner Interface
 */
export interface CliSpinnerInterface {
  start(): void;
  stop(): void;
  succeed(message: string): void;
  fail(message: string): void;
}

/**
 * Logger Interface
 */
export interface CliLoggerInterface {
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string, error?: unknown): void;
  header(message: string): void;
  subHeader(message: string): void;
  step(number: number, message: string): void;
  command(command: string): void;
  list(items: string[], indent?: number): void;
  newLine(): void;
  formatPath(path: string): string;
  formatCommand(command: string): string;
}

/**
 * Common Option Mappers
 */
export const OptionsMapper = {
  /**
   * Map CLI options to setup options
   */
  toSetupOptions(cliOptions: CliOptions): SetupOptions {
    return {
      includeExamples: cliOptions.examples !== false,
      includeDocs: cliOptions.docs !== false,
      installDeps: cliOptions.deps !== false,
      setupConfig: cliOptions.config !== false,
    };
  },

  /**
   * Map CLI options to update options
   */
  toUpdateOptions(cliOptions: CliOptions): UpdateOptions {
    return {
      force: cliOptions.force,
      backup: cliOptions.backup !== false,
      updateDeps: cliOptions.deps !== false,
      updateConfig: cliOptions.config !== false,
    };
  },
};

export default {
  OptionsMapper,
};