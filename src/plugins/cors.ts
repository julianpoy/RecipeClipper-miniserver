import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { ENV } from '../config/environment.js';

export default async function corsPlugin(fastify: FastifyInstance) {
  const origin = ENV.CORS_ORIGIN === '*'
    ? true
    : ENV.CORS_ORIGIN.split(',').map(o => o.trim());

  await fastify.register(cors, {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
}
