import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Required dependencies
const dependencies = [
  '@prisma/client',
  'express',
  'cors',
  'helmet',
  'compression',
  'morgan',
  'winston',
  'dotenv',
  'bcryptjs',
  'jsonwebtoken',
  'zod',
  'express-rate-limit',
  'multer',
  'ioredis'
];

const devDependencies = [
  '@types/node',
  '@types/express',
  '@types/cors',
  '@types/compression',
  '@types/morgan',
  '@types/bcryptjs',
  '@types/jsonwebtoken',
  '@types/multer',
  'typescript',
  'ts-node',
  'ts-node-dev',
  'prisma',
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  'eslint',
  'prettier'
];

function createDirectories() {
  const dirs = [
    'logs',
    'src/api',
    'src/config',
    'src/controllers',
    'src/middleware',
    'src/services',
    'src/utils',
    'src/types',
    'src/lib'
  ];

  dirs.forEach(dir => {
    const path = join(process.cwd(), dir);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

async function setup() {
  try {
    console.log('Setting up project...\n');

    // Create necessary directories
    createDirectories();

    // Install dependencies
    console.log('Installing dependencies...');
    execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
    console.log('Dependencies installed successfully.\n');

    // Install dev dependencies
    console.log('Installing dev dependencies...');
    execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'inherit' });
    console.log('Dev dependencies installed successfully.\n');

    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully.\n');

    console.log('Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create .env file');
    console.log('2. Update database connection URL in .env');
    console.log('3. Run migrations: npx prisma migrate dev');
    console.log('4. Start development server: npm run dev');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();