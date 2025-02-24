import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🚀 Setting up database...');

/**
 * Function to execute shell commands
 */
function executeCommand(command: string) {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    // Generate Prisma client
    console.log('📦 Generating Prisma Client...');
    executeCommand('npx prisma generate');

    // Push the schema to the database
    console.log('🔄 Pushing schema to database...');
    executeCommand('npx prisma db push --accept-data-loss');

    // Seed the database if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌱 Seeding database...');
      executeCommand('npx prisma db seed');
    }

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setup().catch((error) => {
  console.error('Failed to set up database:', error);
  process.exit(1);
});