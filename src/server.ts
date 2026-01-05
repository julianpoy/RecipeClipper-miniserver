import Fastify from 'fastify';
import { ENV, isDevelopment, isSentryEnabled } from './config/environment.js';
import { initializeSentry } from './plugins/sentry.js';
import sentryPlugin from './plugins/sentry.js';
import helmetPlugin from './plugins/helmet.js';
import corsPlugin from './plugins/cors.js';
import sensiblePlugin from './plugins/sensible.js';
import metricsPlugin from './plugins/metrics.js';
import healthRoutes from './routes/health.js';
import metricsRoutes from './routes/metrics.js';
import recipeExtractRoutes from './routes/api/recipe/extract.js';
import textExtractRoutes from './routes/api/text/extract.js';

export async function createServer() {
  if (isSentryEnabled) {
    initializeSentry();
  }

  const server = Fastify({
    logger: isDevelopment
      ? {
          level: ENV.LOG_LEVEL,
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : {
          level: ENV.LOG_LEVEL,
        },
    bodyLimit: ENV.MAX_BODY_SIZE,
    trustProxy: true,
  });

  if (isSentryEnabled) {
    await server.register(sentryPlugin);
  }
  await server.register(helmetPlugin);
  await server.register(corsPlugin);
  await server.register(sensiblePlugin);
  await server.register(metricsPlugin);

  // === Routes ===
  await server.register(healthRoutes);
  await server.register(metricsRoutes);
  await server.register(recipeExtractRoutes);
  await server.register(textExtractRoutes);

  return server;
}
