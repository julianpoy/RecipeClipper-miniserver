import { FastifyInstance } from 'fastify';
import client from 'prom-client';

export const register = new client.Registry();

// Auto-collect default Node.js metrics
client.collectDefaultMetrics({ register });

export const recipeAttemptsCounter = new client.Counter({
  name: 'recipe_extraction_attempts_total',
  help: 'Total number of recipe extraction attempts',
  registers: [register],
});

export const recipeSuccessesCounter = new client.Counter({
  name: 'recipe_extraction_successes_total',
  help: 'Total number of successful recipe extractions',
  registers: [register],
});

export const recipeFailuresCounter = new client.Counter({
  name: 'recipe_extraction_failures_total',
  help: 'Total number of failed recipe extractions',
  registers: [register],
});

export const recipeDurationHistogram = new client.Histogram({
  name: 'recipe_extraction_duration_seconds',
  help: 'Duration of recipe extraction in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const textAttemptsCounter = new client.Counter({
  name: 'text_extraction_attempts_total',
  help: 'Total number of text extraction attempts',
  registers: [register],
});

export const textSuccessesCounter = new client.Counter({
  name: 'text_extraction_successes_total',
  help: 'Total number of successful text extractions',
  registers: [register],
});

export const textFailuresCounter = new client.Counter({
  name: 'text_extraction_failures_total',
  help: 'Total number of failed text extractions',
  registers: [register],
});

export const textDurationHistogram = new client.Histogram({
  name: 'text_extraction_duration_seconds',
  help: 'Duration of text extraction in seconds',
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export default async function metricsPlugin(fastify: FastifyInstance) {
  fastify.log.info('Prometheus metrics at /metrics');
}
