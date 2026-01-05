import { createServer } from './server.js';
import { ENV } from './config/environment.js';

async function start() {
  try {
    const server = await createServer();

    await server.listen({
      port: ENV.PORT,
      host: ENV.HOST,
    });

    console.log(`Server listening at ${ENV.HOST}:${ENV.PORT}`);

    const shutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down gracefully...`);
      try {
        await server.close();
        console.log('Server closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
