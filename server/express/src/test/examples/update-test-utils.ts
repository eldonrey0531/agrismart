import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import config from './setup-config.json';
import type { UpdateOptions } from './utils.interface';

/**
 * Update Utility Interface
 */
export interface UpdateUtility {
  update(options: UpdateOptions): Promise<void>;
  beforeUpdate?(options: UpdateOptions): Promise<void>;
  afterUpdate?(options: UpdateOptions): Promise<void>;
}

/**
 * Create update instance
 */
export const updateUtils = new (class implements UpdateUtility {
  async #createBackup(utilsDir: string): Promise<string> {
    const backupDir = path.join(process.cwd(), 'test-utils-backup');
    await fs.mkdir(backupDir, { recursive: true });
    
    for (const file of config.files.required) {
      const sourcePath = path.join(utilsDir, file);
      const backupPath = path.join(backupDir, file);
      
      try {
        await fs.copyFile(sourcePath, backupPath);
      } catch (error) {
        console.warn(`Could not backup ${file}:`, error);
      }
    }

    return backupDir;
  }

  async #restoreFromBackup(backupDir: string, utilsDir: string): Promise<void> {
    console.log('\nAttempting to restore from backup...');
    try {
      const files = await fs.readdir(backupDir);
      for (const file of files) {
        await fs.copyFile(
          path.join(backupDir, file),
          path.join(utilsDir, file)
        );
      }
      console.log('Successfully restored from backup');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      console.log('Backup files are still available in:', backupDir);
    }
  }

  async #cleanupBackup(backupDir: string): Promise<void> {
    if (!process.env.KEEP_BACKUP) {
      await fs.rm(backupDir, { recursive: true });
    }
  }

  async #updateFiles(utilsDir: string, force: boolean): Promise<void> {
    for (const file of config.files.required) {
      const sourcePath = path.join(__dirname, file);
      const destPath = path.join(utilsDir, file);

      try {
        const [sourceStats, destStats] = await Promise.all([
          fs.stat(sourcePath),
          fs.stat(destPath).catch(() => null),
        ]);

        if (!force && destStats && sourceStats.mtime <= destStats.mtime) {
          console.log(`Skipping ${file} (not modified)`);
          continue;
        }

        await fs.copyFile(sourcePath, destPath);
      } catch (error) {
        throw new Error(`Failed to update ${file}: ${error}`);
      }
    }
  }

  async #updateDependencies(): Promise<void> {
    const devDeps = config.dependencies.dev.join(' ');
    execSync(`npm install -D ${devDeps}`, { stdio: 'inherit' });
  }

  async #updateConfigurations(): Promise<void> {
    // Update Jest config
    const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
    const jestConfig = `module.exports = ${JSON.stringify(config.jest, null, 2)}`;
    await fs.writeFile(jestConfigPath, jestConfig);

    // Update tsconfig
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    await fs.writeFile(
      tsConfigPath,
      JSON.stringify(config.typescript, null, 2)
    );

    // Update package.json scripts
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, 'utf-8')
    );

    packageJson.scripts = {
      ...packageJson.scripts,
      ...config.scripts,
    };

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Optional hook for pre-update operations
   */
  async beforeUpdate(_options: UpdateOptions): Promise<void> {
    // Optional hook - implement in derived classes
  }

  /**
   * Optional hook for post-update operations
   */
  async afterUpdate(_options: UpdateOptions): Promise<void> {
    // Optional hook - implement in derived classes
  }

  /**
   * Main update method
   */
  async update(options: UpdateOptions): Promise<void> {
    const {
      force = false,
      backup = true,
      updateDeps = true,
      updateConfig = true,
    } = options;

    const utilsDir = path.join(process.cwd(), config.directories.utils);
    let backupDir: string | undefined;

    try {
      await this.beforeUpdate(options);

      // Create backup if requested
      if (backup) {
        backupDir = await this.#createBackup(utilsDir);
      }

      // Update files
      await this.#updateFiles(utilsDir, force);

      // Update dependencies if requested
      if (updateDeps) {
        await this.#updateDependencies();
      }

      // Update configurations if requested
      if (updateConfig) {
        await this.#updateConfigurations();
      }

      // Cleanup backup if everything succeeded
      if (backupDir) {
        await this.#cleanupBackup(backupDir);
      }

      await this.afterUpdate(options);

    } catch (error) {
      // Attempt to restore from backup if available
      if (backupDir) {
        await this.#restoreFromBackup(backupDir, utilsDir);
      }

      throw new Error(
        `Failed to update test utilities: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
})();

/**
 * Default export for backward compatibility
 */
export default updateUtils.update.bind(updateUtils);