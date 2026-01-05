import * as Sentry from '@sentry/node';
import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ENV, isSentryEnabled } from '../config/environment.js';

export function initializeSentry() {
  if (!isSentryEnabled) {
    return;
  }

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.SENTRY_ENVIRONMENT,
    tracesSampleRate: ENV.SENTRY_TRACES_SAMPLE_RATE,
  });
}

export default async function sentryPlugin(fastify: FastifyInstance) {
  if (!isSentryEnabled) {
    fastify.log.info('Sentry is disabled (no SENTRY_DSN provided)');
    return;
  }

  fastify.log.info('Sentry error tracking enabled');

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      headers: request.headers,
    });
  });

  fastify.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          headers: request.headers,
        },
      },
    });

    const statusCode = error.statusCode || 500;
    const response: any = {
      statusCode,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    };

    if (ENV.NODE_ENV === 'development') {
      response.stack = error.stack;
    }

    reply.status(statusCode).send(response);
  });
}
