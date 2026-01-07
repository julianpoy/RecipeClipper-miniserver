import { config } from 'dotenv';

// Load .env file
config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  LOG_LEVEL: process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  SENTRY_DSN: process.env.SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  SENTRY_TRACES_SAMPLE_RATE: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),

  INGREDIENT_INSTRUCTION_CLASSIFIER_URL:
    process.env.INGREDIENT_INSTRUCTION_CLASSIFIER_URL || '',

  MAX_BODY_SIZE: parseInt(process.env.MAX_BODY_SIZE || '10485760', 10), // 10MB
  MAX_HTML_SIZE: parseInt(process.env.MAX_HTML_SIZE || '500000', 10),

  WORKER_POOL_MIN_WORKERS: parseInt(process.env.WORKER_POOL_MIN_WORKERS || '1', 10),
  WORKER_POOL_MAX_WORKERS: parseInt(process.env.WORKER_POOL_MAX_WORKERS || '0', 10), // 0 = CPU count
  WORKER_TASK_TIMEOUT: parseInt(process.env.WORKER_TASK_TIMEOUT || '30000', 10),
} as const;

export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';
export const isSentryEnabled = !!ENV.SENTRY_DSN;
