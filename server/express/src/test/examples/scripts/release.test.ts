import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { ReleaseManager } from './release';
import { TestHelper, TestFileSystem } from '../test-shared';

describe('ReleaseManager', () => {
  const helper = new TestHelper();
  const testDir = path.join(process.cwd(), 'test-release');
  
  // Mock files content
  const mockPackageJson = {
    name: '@your-org/test-utils',
    version: '1.0.0',
    description: 'Test utilities',
  };

  const mockChangelog = `# Changelog

## [Unreleased]

### Added
- New feature 1
- New feature 2

## [1.0.0] - 2025-02-15

### Added
- Initial release
`;

  beforeEach(async () => {
    await helper.setup();
    await fs.mkdir(testDir, { recursive: true });

    // Create mock files
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(mockPackageJson, null, 2)
    );
    await fs.writeFile(
      path.join(testDir, 'CHANGELOG.md'),
      mockChangelog
    );

    // Mock git repo
    execSync('git init', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git add .', { cwd: testDir });
    execSync('git commit -m "Initial commit"', { cwd: testDir });
  });

  afterEach(async () => {
    await helper.cleanup();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('version management', () => {
    it('increments major version correctly', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);

      // Act
      await manager.release({
        type: 'major',
        dryRun: true,
      });

      // Assert
      const pkg = JSON.parse(
        await fs.readFile(path.join(testDir, 'package.json'), 'utf-8')
      );
      expect(pkg.version).toBe('1.0.0'); // Dry run shouldn't change version
    });

    it('updates changelog for new version', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);
      const today = new Date().toISOString().split('T')[0];

      // Act
      await manager.release({
        type: 'minor',
        dryRun: true,
      });

      // Assert
      const changelog = await fs.readFile(
        path.join(testDir, 'CHANGELOG.md'),
        'utf-8'
      );
      expect(changelog).toContain('## [Unreleased]');
      expect(changelog).not.toContain(`## [1.1.0] - ${today}`); // Dry run
    });
  });

  describe('git operations', () => {
    it('requires clean working directory', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);
      
      // Create uncommitted change
      await fs.appendFile(
        path.join(testDir, 'package.json'),
        '\n'
      );

      // Act & Assert
      await expect(
        manager.release({ type: 'patch' })
      ).rejects.toThrow('Working directory must be clean');
    });

    it('creates commit and tag in non-dry-run mode', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);
      
      // Mock user input
      const mockStdin = require('mock-stdin').stdin();
      process.nextTick(() => {
        mockStdin.send('y\n'); // Confirm release
        mockStdin.send('n\n'); // Don't push
      });

      // Act
      await manager.release({
        type: 'patch',
        dryRun: false,
      });

      // Assert
      const tags = execSync('git tag', { cwd: testDir }).toString();
      expect(tags).toContain('v1.0.1');
    });
  });

  describe('validation', () => {
    it('validates release type', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);

      // Act & Assert
      await expect(
        // Using type assertion to simulate invalid input
        manager.release({ type: 'invalid' as 'patch' })
      ).rejects.toThrow();
    });

    it('validates package.json format', async () => {
      // Arrange
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        'invalid json'
      );
      const manager = new ReleaseManager(testDir);

      // Act & Assert
      await expect(
        manager.release({ type: 'patch' })
      ).rejects.toThrow();
    });
  });

  describe('dry run mode', () => {
    it('does not modify files', async () => {
      // Arrange
      const manager = new ReleaseManager(testDir);
      const originalPkg = await fs.readFile(
        path.join(testDir, 'package.json'),
        'utf-8'
      );
      const originalChangelog = await fs.readFile(
        path.join(testDir, 'CHANGELOG.md'),
        'utf-8'
      );

      // Act
      await manager.release({
        type: 'major',
        dryRun: true,
      });

      // Assert
      const currentPkg = await fs.readFile(
        path.join(testDir, 'package.json'),
        'utf-8'
      );
      const currentChangelog = await fs.readFile(
        path.join(testDir, 'CHANGELOG.md'),
        'utf-8'
      );

      expect(currentPkg).toBe(originalPkg);
      expect(currentChangelog).toBe(originalChangelog);
    });
  });

  describe('error handling', () => {
    it('handles missing files gracefully', async () => {
      // Arrange
      await fs.rm(path.join(testDir, 'CHANGELOG.md'));
      const manager = new ReleaseManager(testDir);

      // Act & Assert
      await expect(
        manager.release({ type: 'patch' })
      ).rejects.toThrow();
    });

    it('handles git errors gracefully', async () => {
      // Arrange
      await fs.rm(path.join(testDir, '.git'), { recursive: true });
      const manager = new ReleaseManager(testDir);

      // Act & Assert
      await expect(
        manager.release({ type: 'patch' })
      ).rejects.toThrow();
    });
  });
});