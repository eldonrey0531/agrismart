import { app } from './app';
import { config } from './config';

const startServer = async (): Promise<void> => {
  try {
    const server = app.listen(config.ENV.PORT, () => {
      console.log(
        `Server is running on http://${config.ENV.HOST}:${config.ENV.PORT}`
      );
      console.log(`Mode: ${config.ENV.NODE_ENV}`);
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    await new Promise((resolve) => server.once('listening', resolve));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();