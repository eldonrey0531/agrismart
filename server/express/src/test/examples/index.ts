import { setupUtils } from './setup-test-utils';
import { updateUtils } from './update-test-utils';
import { ErrorUtils } from './test-errors';
import { HttpUtils } from './http-utils';
import { TimingUtils } from './timing-utils';
import { CliLogger, CliSpinner } from './cli-logger';
import { OptionsMapper } from './utils.interface';
import config from './setup-config.json';
import {
  // Response Types
  type ApiResponse,
  type ErrorResponse,
  type SuccessResponse,
  
  // User Types
  type TestUser,
  type LoginData,
  type TokenResponse,
  
  // Request Types
  type SignupRequest,
  type LoginRequest,
  type ChangePasswordRequest,
  type UpdateProfileRequest,
  
  // Error Types
  type ErrorDetails,
  ErrorType,
  HttpStatus,
  
  // Config Types
  type TestConfig,
  type ApiPaths,
  type ErrorMessages,
  
  // Utility Types
  type SetupOptions,
  type UpdateOptions,
  type CliOptions,

  // Type Utilities
  Types,
} from './test-types';

/**
 * Core Utilities
 */
export const core = {
  setup: setupUtils,
  update: updateUtils,
  error: ErrorUtils,
  http: HttpUtils,
  timing: TimingUtils,
};

/**
 * CLI Utilities
 */
export const cli = {
  logger: CliLogger,
  spinner: CliSpinner,
  options: OptionsMapper,
  config,
};

/**
 * Type Constants
 */
export const constants = {
  errorType: ErrorType,
  httpStatus: HttpStatus,
};

/**
 * Type Guards and Utilities
 */
export const utils = {
  types: Types,
};

/**
 * Export Types
 */
export type {
  // Response Types
  ApiResponse,
  ErrorResponse,
  SuccessResponse,
  
  // User Types
  TestUser,
  LoginData,
  TokenResponse,
  
  // Request Types
  SignupRequest,
  LoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  
  // Error Types
  ErrorDetails,
  
  // Config Types
  TestConfig,
  ApiPaths,
  ErrorMessages,
  
  // Utility Types
  SetupOptions,
  UpdateOptions,
  CliOptions,
};

/**
 * Default Export
 */
export default {
  ...core,
  cli,
  utils,
  constants,
  config,
};

/**
 * Re-exports for backward compatibility
 */
export {
  setupUtils as setup,
  updateUtils as update,
  ErrorUtils as error,
  HttpUtils as http,
  TimingUtils as timing,
  CliLogger as logger,
  CliSpinner as spinner,
  OptionsMapper as options,
  ErrorType,
  HttpStatus,
  Types,
};