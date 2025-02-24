#!/usr/bin/env node
import { startServer } from '../src/server';
import { config } from '../src/config';

// Enable source maps for stack traces
import 'source-map-support/register';

// Environment validation
if (!config.JWT.SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!config.DATABASE.URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Log startup info
console.log('=================================');
console.log('🔧 Starting server with configuration:');
console.log(`📍 Environment: ${config.ENV.NODE_ENV}`);
console.log(`🔌 Port: ${config.ENV.PORT}`);
console.log(`📡 API URL: ${config.APP.URL}${config.APP.API_PREFIX}`);
console.log('=================================');

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});