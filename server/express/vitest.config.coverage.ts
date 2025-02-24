import { defineConfig, UserConfig } from 'vitest/config';
import baseConfig from './vitest.config';
import { mergeConfig } from 'vite';

const coverageConfig: UserConfig = {
  test: {
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
    environment: 'node',
    globals: true,
    threads: false,
    isolate: false,
    watch: false,
    reporters: ['default', 'html'],
    outputFile: './coverage/test-results.html',
  },
};

export default mergeConfig(baseConfig, defineConfig(coverageConfig));

// Custom coverage reporter class
class CustomCoverageReporter {
  private summaries: any[] = [];

  onRunComplete(_contexts: any, results: any) {
    if (results.coverage) {
      this.printSummary(results.coverage);
    }
  }

  private printSummary(coverage: any) {
    console.log('\nCoverage Summary:');
    console.log('-----------------');
      
    Object.entries(coverage).forEach(([file, data]: [string, any]) => {
      const summary = this.calculateFileCoverage(file, data);
      this.summaries.push(summary);
      this.printFileSummary(summary);
    });

    const overall = this.calculateOverall();
    this.printOverallSummary(overall);
  }

  private calculateFileCoverage(file: string, data: any) {
    return {
      file,
      statements: data.statements?.pct ?? 0,
      branches: data.branches?.pct ?? 0,
      functions: data.functions?.pct ?? 0,
      lines: data.lines?.pct ?? 0,
    };
  }

  private printFileSummary(summary: any) {
    console.log(`\nFile: ${summary.file}`);
    console.log(`  Statements : ${summary.statements}%`);
    console.log(`  Branches   : ${summary.branches}%`);
    console.log(`  Functions  : ${summary.functions}%`);
    console.log(`  Lines      : ${summary.lines}%`);
  }

  private calculateOverall() {
    if (this.summaries.length === 0) {
      return {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      };
    }

    const total = this.summaries.reduce(
      (acc, curr) => ({
        statements: acc.statements + curr.statements,
        branches: acc.branches + curr.branches,
        functions: acc.functions + curr.functions,
        lines: acc.lines + curr.lines,
      }),
      { statements: 0, branches: 0, functions: 0, lines: 0 }
    );

    const count = this.summaries.length;
    return {
      statements: (total.statements / count).toFixed(2),
      branches: (total.branches / count).toFixed(2),
      functions: (total.functions / count).toFixed(2),
      lines: (total.lines / count).toFixed(2),
    };
  }

  private printOverallSummary(overall: any) {
    console.log('\nOverall Coverage:');
    console.log('----------------');
    console.log(`  Statements : ${overall.statements}%`);
    console.log(`  Branches   : ${overall.branches}%`);
    console.log(`  Functions  : ${overall.functions}%`);
    console.log(`  Lines      : ${overall.lines}%`);
  }
}

export { CustomCoverageReporter };