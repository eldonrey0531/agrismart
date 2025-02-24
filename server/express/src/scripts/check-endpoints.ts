import chalk from 'chalk';
import { Express } from 'express-serve-static-core';
import { createApp } from '../app';
import { connectDB } from '../lib/db';

interface EndpointCheck {
  path: string;
  method: string;
  auth: boolean;
  handler: string;
  middleware: string[];
  status: 'ok' | 'error';
  error?: string;
}

interface RouteLayer {
  route?: {
    path: string;
    stack: any[];
    methods: { [key: string]: boolean };
  };
  name: string;
  handle: Function;
}

async function getMiddlewareNames(stack: any[]): Promise<string[]> {
  return stack
    .map((layer: any) => layer.name)
    .filter((name: string) => name !== '<anonymous>' && name !== 'handle');
}

async function checkEndpoint(app: Express, path: string, method: string): Promise<boolean> {
  try {
    // Make a test request to the endpoint
    const response = await fetch(`http://localhost:3000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // We consider 401/403 as "working" since they indicate auth is required
    return response.status !== 404;
  } catch (error) {
    console.error(chalk.red(`Error checking ${method} ${path}:`, error));
    return false;
  }
}

async function checkAllEndpoints() {
  console.log(chalk.blue('Checking API endpoints...'));

  // Initialize app and database
  await connectDB();
  const app = createApp();

  const endpoints: EndpointCheck[] = [];
  const router = (app as any)._router;

  if (!router || !router.stack) {
    console.error(chalk.red('No routes found in the application'));
    process.exit(1);
  }

  // Get all route layers
  const routeLayers = router.stack.filter((layer: RouteLayer) => layer.route);

  for (const layer of routeLayers) {
    const path = layer.route?.path;
    const methods = Object.keys(layer.route?.methods || {}).map(m => m.toUpperCase());
    const middleware = await getMiddlewareNames(layer.route?.stack || []);
    
    for (const method of methods) {
      const isAuthRequired = middleware.some(m => 
        m === 'authenticate' || 
        m === 'requireAuth' || 
        m === 'checkAuth'
      );

      const endpoint: EndpointCheck = {
        path,
        method,
        auth: isAuthRequired,
        handler: layer.route?.stack[layer.route?.stack.length - 1]?.name || 'unknown',
        middleware,
        status: 'ok'
      };

      try {
        const isWorking = await checkEndpoint(app, path, method);
        if (!isWorking) {
          endpoint.status = 'error';
          endpoint.error = 'Endpoint not responding';
        }
      } catch (error) {
        endpoint.status = 'error';
        endpoint.error = error instanceof Error ? error.message : 'Unknown error';
      }

      endpoints.push(endpoint);
    }
  }

  // Print results
  console.log('\nAPI Endpoints Status:\n');
  
  endpoints.forEach(endpoint => {
    const methodColor = endpoint.status === 'ok' ? 'green' : 'red';
    const authStatus = endpoint.auth ? chalk.yellow('[Auth Required]') : '';
    
    console.log(
      `${chalk[methodColor](endpoint.method.padEnd(8))} ${endpoint.path.padEnd(40)} ${authStatus}`
    );
    
    if (endpoint.middleware.length) {
      console.log(chalk.gray(`  ↳ Middleware: ${endpoint.middleware.join(', ')}`));
    }
    
    if (endpoint.error) {
      console.log(chalk.red(`  ↳ Error: ${endpoint.error}`));
    }
  });

  // Summary
  const total = endpoints.length;
  const working = endpoints.filter(e => e.status === 'ok').length;
  const failed = total - working;

  console.log('\nSummary:');
  console.log(chalk.blue(`Total Endpoints: ${total}`));
  console.log(chalk.green(`Working: ${working}`));
  
  if (failed > 0) {
    console.log(chalk.red(`Failed: ${failed}`));
    process.exit(1);
  }

  process.exit(0);
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkAllEndpoints().catch(error => {
    console.error(chalk.red('Error checking endpoints:', error));
    process.exit(1);
  });
}