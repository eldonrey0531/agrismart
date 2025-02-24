import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Generate Prisma client and ensure types are available
 */
async function generatePrisma() {
  console.log('🚀 Generating Prisma client...');

  try {
    // Ensure prisma directory exists
    const prismaDir = path.resolve(__dirname, '../prisma');
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }

    // Generate Prisma client
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    // Ensure client is generated
    const clientPath = path.resolve(__dirname, '../node_modules/.prisma/client');
    if (!fs.existsSync(clientPath)) {
      throw new Error('Prisma client was not generated');
    }

    // Create a local type export for convenience
    const typesContent = `export * from '@prisma/client';`;
    const typesPath = path.resolve(__dirname, '../src/types/prisma.ts');
    
    // Ensure types directory exists
    const typesDir = path.dirname(typesPath);
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    fs.writeFileSync(typesPath, typesContent);

    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error);
    process.exit(1);
  }
}

// Run generation
generatePrisma().catch((error) => {
  console.error('Failed to run generation:', error);
  process.exit(1);
});