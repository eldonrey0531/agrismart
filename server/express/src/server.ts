import express from 'express';
import { createServer } from 'http';
import app from './app';

const port = process.env.PORT || 5000;
const server = createServer(app);

// Log middleware registration
app._router?.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log(`Route: ${middleware.route.path}`);
  } else if (middleware.name) {
    console.log(`Middleware: ${middleware.name}`);
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Available routes:');
  console.log('- /api/v1/health');
  console.log('- /api/v1/status');
  console.log('- /api/v1/admin');
  console.log('- /api/v1/auth/*');
  console.log('- /api/v1/marketplace');
  console.log('- /api/v1/chat');
  console.log('- /api/v1/analytics');
});

export default server;
