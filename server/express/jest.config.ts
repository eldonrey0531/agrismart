import type { Config } from '@jest/types';
import { resolve } from 'path';

const config: Config.InitialOptions = {
  // Test environment
  testEnvironment: resolve(__dirname, './src/test/environment.ts'),
  setupFilesAfterEnv: ['<rootDir>/src/test/jest-setup.ts'],

  // TypeScript configuration
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: {
          ignoreCodes: [1343] // Ignore 'new' expression error for mocks
        },
        astTransformers: {
          before: [
            {
              path: 'ts-jest-mock-import-meta',
              options: { metaObjectReplacement: { url: 'http://localhost' } }
            }
          ]
        }
      }
    ]
  },

  // Module configuration
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'identity-obj-proxy'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],

  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/test/**',
    '!<rootDir>/src/types/**',
    '!<rootDir>/src/**/__tests__/**',
    '!<rootDir>/src/**/*.test.ts',
    '!<rootDir>/src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },

  // Performance options
  maxWorkers: '50%',
  testTimeout: 10000,

  // Error handling
  bail: false,
  verbose: true,

  // Mocking behavior
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Watch options
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // Environment options
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
      diagnostics: {
        warnOnly: true
      }
    }
  }
};

export default config;