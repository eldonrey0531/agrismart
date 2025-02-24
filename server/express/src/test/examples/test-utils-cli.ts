#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { setupUtils } from './setup-test-utils';
import { updateUtils } from './update-test-utils';
import config from './setup-config.json';
import { CliSpinner, CliLogger as Log } from './cli-logger';
import { OptionsMapper, type CliOptions } from './utils.interface';

/**
 * CLI Program
 */
const program = new Command();

/**
 * Setup Command Handler
 */
async function handleSetup(options: CliOptions): Promise<void> {
  const spinner = new CliSpinner('Setting up test utilities...');
  spinner.start();

  try {
    await setupUtils.setup(OptionsMapper.toSetupOptions(options));
    spinner.succeed('Test utilities setup complete!');
    
    Log.header('Next steps:');
    Log.step(1, `Review the documentation in ${Log.formatPath('src/test/utils/')}`);
    Log.step(2, 'Check out the example tests');
    Log.step(3, `Run ${Log.formatCommand('npm test')} to verify the setup`);
  } catch (error) {
    spinner.fail('Setup failed!');
    Log.error('Setup error:', error);
    process.exit(1);
  }
}

/**
 * Update Command Handler
 */
async function handleUpdate(options: CliOptions): Promise<void> {
  const spinner = new CliSpinner('Updating test utilities...');
  spinner.start();

  try {
    await updateUtils.update(OptionsMapper.toUpdateOptions(options));
    spinner.succeed('Test utilities update complete!');

    Log.header('Next steps:');
    Log.step(1, 'Review the changes in your test files');
    Log.step(2, `Run ${Log.formatCommand('npm test')} to verify everything works`);
    Log.step(3, 'Commit the updates to your repository');
  } catch (error) {
    spinner.fail('Update failed!');
    Log.error('Update error:', error);
    process.exit(1);
  }
}

/**
 * List Command Handler
 */
function handleList(): void {
  Log.header('Available test utilities:');
    
  Log.subHeader('Required files:');
  Log.list(config.files.required);

  Log.subHeader('Example files:');
  Log.list(config.files.examples);

  Log.subHeader('Documentation:');
  Log.list(config.files.docs);

  Log.subHeader('Dependencies:');
  Log.list(config.dependencies.dev.map(dep => `${dep} (required)`));
  Log.list(config.dependencies.optional.map(dep => `${dep} (optional)`));
}

/**
 * Doctor Command Handler
 */
async function handleDoctor(): Promise<void> {
  const spinner = new CliSpinner('Checking test utilities...');
  spinner.start();

  try {
    const issues: string[] = [];
    const utilsDir = path.join(process.cwd(), 'src/test/utils');

    // Check required files
    for (const file of config.files.required) {
      try {
        await fs.access(path.join(utilsDir, file));
      } catch {
        issues.push(`Missing required file: ${file}`);
      }
    }

    // Check configurations
    try {
      await fs.access('jest.config.js');
    } catch {
      issues.push('Missing jest.config.js');
    }

    try {
      await fs.access('tsconfig.json');
    } catch {
      issues.push('Missing tsconfig.json');
    }

    // Check package.json
    try {
      const pkg = JSON.parse(
        await fs.readFile('package.json', 'utf-8')
      );

      // Check dependencies
      for (const dep of config.dependencies.dev) {
        if (!pkg.devDependencies?.[dep]) {
          issues.push(`Missing dev dependency: ${dep}`);
        }
      }

      // Check scripts
      for (const [name, script] of Object.entries(config.scripts)) {
        if (pkg.scripts?.[name] !== script) {
          issues.push(`Missing or incorrect script: ${name}`);
        }
      }
    } catch {
      issues.push('Could not read package.json');
    }

    spinner.stop();

    if (issues.length === 0) {
      Log.success('All test utilities are properly configured!');
    } else {
      Log.warning('Found some issues:');
      Log.list(issues);
      Log.info(`Run ${Log.formatCommand('test-utils update')} to fix these issues.`);
    }
  } catch (error) {
    spinner.fail('Health check failed!');
    Log.error('Doctor error:', error);
    process.exit(1);
  }
}

program
  .name('test-utils')
  .description('CLI to manage test utilities')
  .version('1.0.0');

program
  .command('setup')
  .description('Set up test utilities in your project')
  .option('--no-examples', 'Skip example files')
  .option('--no-docs', 'Skip documentation files')
  .option('--no-deps', 'Skip dependency installation')
  .option('--no-config', 'Skip configuration setup')
  .action(handleSetup);

program
  .command('update')
  .description('Update existing test utilities')
  .option('-f, --force', 'Force update all files')
  .option('--no-backup', 'Skip backup before updating')
  .option('--no-deps', 'Skip dependency updates')
  .option('--no-config', 'Skip configuration updates')
  .action(handleUpdate);

program
  .command('list')
  .description('List available test utilities')
  .action(handleList);

program
  .command('doctor')
  .description('Check test utilities health')
  .action(handleDoctor);

if (require.main === module) {
  program.parse(process.argv);
}

export { program };