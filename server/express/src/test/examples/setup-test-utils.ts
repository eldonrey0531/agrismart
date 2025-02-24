import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import config from './setup-config.json';
import type { SetupOptions } from './utils.interface';

/**
 * Setup Utility Interface
 */
export interface SetupUtility {
  setup(options: SetupOptions): Promise<void>;
  beforeSetup?(options: SetupOptions): Promise<void>;
  afterSetup?(options: SetupOptions): Promise<void>;
}

/**
 * Create setup instance
 */
export const setupUtils = new (class implements SetupUtility {
  async #installDependencies(): Promise<void> {
    const devDeps = config.dependencies.dev.join(' ');
    execSync(`npm install -D ${devDeps}`, { stdio: 'inherit' });
  }

  async #createDirectories(): Promise<{ testDir: string; utilsDir: string }> {
    const testDir = path.join(process.cwd(), 'src', 'test');
    const utilsDir = path.join(testDir, 'utils');
    
    await fs.mkdir(utilsDir, { recursive: true });

    return { testDir, utilsDir };
  }

  async #copyFiles(
    utilsDir: string,
    testDir: string,
    options: SetupOptions
  ): Promise<void> {
    const { includeExamples = true, includeDocs = true } = options;

    // Copy required files
    for (const file of config.files.required) {
      const source = path.join(__dirname, file);
      const dest = path.join(utilsDir, file);
      await fs.copyFile(source, dest);
    }

    // Copy example files if requested
    if (includeExamples) {
      const examplesDir = path.join(testDir, 'examples');
      await fs.mkdir(examplesDir, { recursive: true });

      for (const file of config.files.examples) {
        const source = path.join(__dirname, file);
        const dest = path.join(examplesDir, file);
        await fs.copyFile(source, dest);
      }
    }

    // Copy documentation if requested
    if (includeDocs) {
      for (const file of config.files.docs) {
        const source = path.join(__dirname, file);
        const dest = path.join(utilsDir, file);
        await fs.copyFile(source, dest);
      }
    }
  }

  async #configureProject(): Promise<void> {
    // Create Jest config
    const jestConfig = `module.exports = ${JSON.stringify(config.jest, null, 2)}`;
    await fs.writeFile('jest.config.js', jestConfig);

    // Update tsconfig
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify(config.typescript, null, 2)
    );

    // Update package.json scripts
    const packageJson = JSON.parse(
      await fs.readFile('package.json', 'utf-8')
    );

    packageJson.scripts = {
      ...packageJson.scripts,
      ...config.scripts,
    };

    await fs.writeFile(
      'package.json',
      JSON.stringify(packageJson, null, 2)
    );

    // Create or update gitignore
    const gitignorePath = '.gitignore';
    let gitignoreContent = '';
    try {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    } catch {
      gitignoreContent = '';
    }

    const newEntries = config.gitignore
      .filter(entry => !gitignoreContent.includes(entry));

    if (newEntries.length > 0) {
      await fs.appendFile(
        gitignorePath,
        '\n' + newEntries.join('\n')
      );
    }
  }

  /**
   * Optional hook for pre-setup operations
   */
  async beforeSetup(_options: SetupOptions): Promise<void> {
    // Optional hook - implement in derived classes
  }

  /**
   * Optional hook for post-setup operations
   */
  async afterSetup(_options: SetupOptions): Promise<void> {
    // Optional hook - implement in derived classes
  }

  /**
   * Main setup method
   */
  async setup(options: SetupOptions): Promise<void> {
    try {
      await this.beforeSetup(options);

      const {
        includeExamples = true,
        includeDocs = true,
        installDeps = true,
        setupConfig = true,
      } = options;

      // Create directories
      const { testDir, utilsDir } = await this.#createDirectories();

      // Copy files
      await this.#copyFiles(utilsDir, testDir, {
        includeExamples,
        includeDocs,
      });

      // Install dependencies if requested
      if (installDeps) {
        await this.#installDependencies();
      }

      // Configure project if requested
      if (setupConfig) {
        await this.#configureProject();
      }

      await this.afterSetup(options);

    } catch (error) {
      throw new Error(
        `Failed to setup test utilities: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
})();

/**
 * Default export for backward compatibility
 */
export default setupUtils.setup.bind(setupUtils);