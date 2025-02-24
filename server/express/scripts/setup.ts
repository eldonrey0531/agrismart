import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Execute shell command
 */
function execute(command: string) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute: ${command}`, error);
    process.exit(1);
  }
}

/**
 * Create .env file if it doesn't exist
 */
function setupEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const envExamplePath = path.resolve(__dirname, '../.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from example');
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🚀 Setting up Express server...');

  try {
    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    execute('npm install');

    // Setup environment
    console.log('\n⚙️  Setting up environment...');
    setupEnv();

    // Generate Prisma client
    console.log('\n🗃️  Generating Prisma client...');
    execute('npx prisma generate');

    // Create database if it doesn't exist
    console.log('\n🏗️  Setting up database...');
    execute('npx prisma db push --accept-data-loss');

    // Seed database in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🌱 Seeding database...');
      execute('npx prisma db seed');
    }

    // Build TypeScript
    console.log('\n📦 Building TypeScript...');
    execute('npm run build');

    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update DATABASE_URL in .env if needed');
    console.log('2. Run "npm run dev" to start development server');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setup().catch((error) => {
    console.error('Failed to run setup:', error);
    process.exit(1);
  });
}