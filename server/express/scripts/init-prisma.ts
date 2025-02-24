import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 Initializing Prisma setup...');

const ENV_FILE = path.resolve(__dirname, '../.env');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chat_app';

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
 * Create or update .env file
 */
function setupEnvFile() {
  const envContent = `
DATABASE_URL="${DATABASE_URL}"
NODE_ENV="development"
JWT_SECRET="dev-jwt-secret"
COOKIE_SECRET="dev-cookie-secret"
`;

  try {
    fs.writeFileSync(ENV_FILE, envContent.trim());
    console.log('✅ Created .env file');
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
    process.exit(1);
  }
}

/**
 * Main initialization function
 */
async function init() {
  try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    executeCommand('npm install --save @prisma/client bcryptjs');
    executeCommand('npm install --save-dev prisma @types/bcryptjs');

    // Create .env file if it doesn't exist
    if (!fs.existsSync(ENV_FILE)) {
      setupEnvFile();
    }

    // Initialize Prisma
    console.log('🏗️  Initializing Prisma...');
    executeCommand('npx prisma generate');

    // Push the schema to the database
    console.log('🔄 Pushing schema to database...');
    executeCommand('npx prisma db push --accept-data-loss');

    // Run database seed
    console.log('🌱 Seeding database...');
    executeCommand('npx prisma db seed');

    console.log('\n✅ Prisma setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update DATABASE_URL in .env if needed');
    console.log('2. Run "npm run dev" to start the development server');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run initialization
init().catch((error) => {
  console.error('Failed to initialize:', error);
  process.exit(1);
});