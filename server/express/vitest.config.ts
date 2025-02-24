/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [
      './vitest.setup.ts',
      './__tests__/utils/customMatchers.ts'
    ],
    include: ['**/__tests__/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        '**/interfaces/**',
        'coverage/**',
        '__tests__/utils/**',
        '__tests__/setup.ts',
      ],
      all: true,
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
      reportsDirectory: './coverage',
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    maxConcurrency: 1,
    sequence: {
      hooks: 'list',
    },
    alias: {
      '@': path.resolve(__dirname, './'),
      '@tests': path.resolve(__dirname, './__tests__'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@tests': path.resolve(__dirname, './__tests__'),
    },
  },
});