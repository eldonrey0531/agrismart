#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

interface ReleaseOptions {
  type: 'major' | 'minor' | 'patch';
  dryRun?: boolean;
}

interface PackageJson {
  version: string;
  name: string;
  [key: string]: unknown;
}

class ReleaseManager {
  #rootDir: string;
  #changelogPath: string;
  #packageJsonPath: string;

  constructor(rootDir: string) {
    this.#rootDir = rootDir;
    this.#changelogPath = path.join(rootDir, 'CHANGELOG.md');
    this.#packageJsonPath = path.join(rootDir, 'package.json');
  }

  async #readPackageJson(): Promise<PackageJson> {
    const content = await fs.readFile(this.#packageJsonPath, 'utf-8');
    return JSON.parse(content);
  }

  async #writePackageJson(data: PackageJson): Promise<void> {
    await fs.writeFile(
      this.#packageJsonPath,
      JSON.stringify(data, null, 2) + '\n'
    );
  }

  async #readChangelog(): Promise<string> {
    return fs.readFile(this.#changelogPath, 'utf-8');
  }

  async #writeChangelog(content: string): Promise<void> {
    await fs.writeFile(this.#changelogPath, content);
  }

  #incrementVersion(version: string, type: ReleaseOptions['type']): string {
    const [major, minor, patch] = version.split('.').map(Number);
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  async #updateChangelog(version: string): Promise<void> {
    const changelog = await this.#readChangelog();
    const today = new Date().toISOString().split('T')[0];
    
    const updatedChangelog = changelog.replace(
      '## [Unreleased]',
      `## [Unreleased]\n\n## [${version}] - ${today}`
    );

    await this.#writeChangelog(updatedChangelog);
  }

  #runTests(): void {
    console.log('Running tests...');
    execSync('npm test', { stdio: 'inherit' });
  }

  #buildPackage(): void {
    console.log('Building package...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  async #prompt(question: string): Promise<string> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async release({ type, dryRun = false }: ReleaseOptions): Promise<void> {
    try {
      // Ensure clean working directory
      execSync('git diff --quiet', { stdio: 'inherit' });
    } catch {
      throw new Error('Working directory must be clean');
    }

    // Read current version
    const pkg = await this.#readPackageJson();
    const currentVersion = pkg.version;
    const newVersion = this.#incrementVersion(currentVersion, type);

    console.log(`Preparing ${type} release:`);
    console.log(`- Current version: ${currentVersion}`);
    console.log(`- New version: ${newVersion}`);

    if (dryRun) {
      console.log('Dry run complete');
      return;
    }

    const confirm = await this.#prompt('Continue? (y/N) ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Release cancelled');
      return;
    }

    // Run tests
    this.#runTests();

    // Build package
    this.#buildPackage();

    // Update package.json
    pkg.version = newVersion;
    await this.#writePackageJson(pkg);

    // Update changelog
    await this.#updateChangelog(newVersion);

    // Create git commit and tag
    execSync(`git add ${this.#changelogPath} ${this.#packageJsonPath}`, {
      stdio: 'inherit',
    });
    execSync(`git commit -m "chore: release v${newVersion}"`, {
      stdio: 'inherit',
    });
    execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, {
      stdio: 'inherit',
    });

    // Push changes
    const pushConfirm = await this.#prompt('Push changes? (y/N) ');
    if (pushConfirm.toLowerCase() === 'y') {
      execSync('git push origin main --tags', { stdio: 'inherit' });
      
      // Publish to npm
      const publishConfirm = await this.#prompt('Publish to npm? (y/N) ');
      if (publishConfirm.toLowerCase() === 'y') {
        execSync('npm publish', { stdio: 'inherit' });
      }
    }

    console.log(`\n✨ Released v${newVersion}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] as ReleaseOptions['type'];
  const dryRun = args.includes('--dry-run');

  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('Usage: release.ts <major|minor|patch> [--dry-run]');
    process.exit(1);
  }

  try {
    const manager = new ReleaseManager(process.cwd());
    await manager.release({ type, dryRun });
  } catch (error) {
    console.error('Release failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ReleaseManager };